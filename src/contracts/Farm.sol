pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/Math.sol";
import "./Token.sol";

contract Farm {
    using SafeMath for uint256;

    Token private token;

    struct Square {
        Fruit fruit;
        uint createdAt;
    }

    mapping(address => Square[]) fields;
    mapping(address => uint) syncedAt;

    constructor(Token _token) public {
        token = _token;
    }

    event FarmCreated(address indexed _address);
    event FarmSynced(address indexed _address);

    function createFarm() public {
        uint synced = syncedAt[msg.sender];
        require(synced == 0, "Farm already exists");

        Square[] storage land = fields[msg.sender];
        Square memory empty = Square({
            fruit: Fruit.None,
            createdAt: block.timestamp
        });
        Square memory apple = Square({
            fruit: Fruit.Apple,
            createdAt: block.timestamp
        });

        // Each farmer starts with 5 fields & 3 apples
        land.push(empty);
        land.push(apple);
        land.push(apple);
        land.push(apple);
        land.push(empty);

        syncedAt[msg.sender] = block.timestamp;

        //Emit an event
        emit FarmCreated(msg.sender);
    }
    
    function lastSyncedAt() public view returns(uint) {
        return syncedAt[msg.sender];
    }


    function getLand() public view returns (Square[] memory) {
        return fields[msg.sender];
    }

    enum Action { Plant, Harvest }
    enum Fruit { None, Apple, Avocado, Banana, Coconut, Pineapple, Money, Diamond }

    struct Event { 
        Action action;
        Fruit fruit;
        uint landIndex;
        uint createdAt;
    }

    struct Farm {
        Square[] land;
        uint balance;
    }

    function getHarvestHours(Fruit _fruit) private view returns (uint) {
        if (_fruit == Fruit.Apple) {
            return 1;
        } else if (_fruit == Fruit.Avocado) {
            return 3;
        } else if (_fruit == Fruit.Banana) {
            return 8;
        } else if (_fruit == Fruit.Coconut) {
            // 1 Day
            return 24;
        } else if (_fruit == Fruit.Pineapple) {
            // 3 days
            return 72;
        } else if (_fruit == Fruit.Money) {
            // 1 week
            return 168;
        } else if (_fruit == Fruit.Diamond) {
            // 4 weeks
            return 672;
        }

        require(false, "Invalid fruit");
        return 9999999;
    }

    function getSeedPrice(Fruit _fruit) private view returns (uint price) {
        uint decimals = token.decimals();

        if (_fruit == Fruit.Apple) {
            //$0.01
            return 1 * 10**decimals / 100;
        } else if (_fruit == Fruit.Avocado) {
            // $0.06
            return 6 * 10**decimals / 100;
        } else if (_fruit == Fruit.Banana) {
            // $0.20
            return 20 * 10**decimals / 100;
        } else if (_fruit == Fruit.Coconut) {
            // $1
            return 1 * 10**decimals;
        } else if (_fruit == Fruit.Pineapple) {
            // $2
            return 2 * 10**decimals;
        } else if (_fruit == Fruit.Money) {
            // $10
            return 10 * 10**decimals;
        } else if (_fruit == Fruit.Diamond) {
            // $200
            return 200 * 10**decimals;
        }

        require(false, "Invalid fruit");

        return 100000 * 10**decimals;
    }

    function getFruitPrice(Fruit _fruit) private view returns (uint price) {
        uint decimals = token.decimals();

        if (_fruit == Fruit.Apple) {
            // $0.02
            return 2 * 10**decimals / 100;
        } else if (_fruit == Fruit.Avocado) {
            // $0.12
            return 12 * 10**decimals / 100;
        } else if (_fruit == Fruit.Banana) {
            // $0.56
            return 56 * 10**decimals / 100;
        } else if (_fruit == Fruit.Coconut) {
            // $2.30
            return 230 * 10**decimals / 100;
        } else if (_fruit == Fruit.Pineapple) {
            // $6.40
            return 640 * 10**decimals / 100;
        } else if (_fruit == Fruit.Money) {
            // $20
            return 20 * 10**decimals;
        } else if (_fruit == Fruit.Diamond) {
            // $250
            return 250 * 10**decimals;
        }

        require(false, "Invalid fruit");

        return 0;
    }
    
    function requiredLandSize(Fruit _fruit) private view returns (uint size) {
        if (_fruit == Fruit.Apple || _fruit == Fruit.Avocado) {
            return 5;
        } else if (_fruit == Fruit.Banana || _fruit == Fruit.Coconut) {
            return 8;
        } else if (_fruit == Fruit.Pineapple) {
            return 11;
        } else if (_fruit == Fruit.Money) {
            return 14;
        } else if (_fruit == Fruit.Diamond) {
            return 17;
        }

        require(false, "Invalid fruit");

        return 99;
    }
    
       
    function getLandPrice(uint landSize) private view returns (uint price) {
        uint decimals = token.decimals();
        if (landSize <= 5) {
            // $1
            return 1 * 10**decimals;
        } else if (landSize <= 8) {
            // $5
            return 5 * 10**decimals;
        } else if (landSize <= 11) {
            // $50
            return 50 * 10**decimals;
        }
        
        return 5000 * 10**decimals;
    }


    function concatenate(
        string memory a,
        string memory b)
        internal
        pure
        returns(string memory) {
            return string(abi.encodePacked(a, b));
        }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    modifier hasFarm {
        require(lastSyncedAt() > 0, "Farm does not exist");
        _;
    }
     
    uint private THIRTY_MINUTES = 30 * 60;

    function buildFarm(Event[] memory _events) public view returns (Farm memory currentFarm) {
        Square[] memory land = fields[msg.sender];
        uint balance = token.balanceOf(msg.sender);
        
        // Provide them the conversion at the time of planting
        uint conversion = getMarketRate();

        for (uint index = 0; index < _events.length; index++) {
            Event memory farmEvent = _events[index];

            uint thirtyMinutesAgo = block.timestamp - THIRTY_MINUTES; 
            require(farmEvent.createdAt >= thirtyMinutesAgo, "Events can only be 30 minutes old");
            
            require(farmEvent.createdAt >= lastSyncedAt(), "You can not perform an action in the past");
            require(farmEvent.createdAt <= block.timestamp, "You can not perform an action in the future");

            if (index > 0) {
                require(farmEvent.createdAt >= _events[index - 1].createdAt, "Events are not in order");
            }

            require(land.length >= requiredLandSize(farmEvent.fruit), "Your farm is not ready to plant this fruit. Level up first.");

            if (farmEvent.action == Action.Plant) {
                uint price = getSeedPrice(farmEvent.fruit);
                uint fmcPrice = getMarketPrice(price);
                require(balance >= fmcPrice, "Not enough money to buy seed");

                balance = balance.sub(fmcPrice);

                Square memory plantedSeed = Square({
                    fruit: farmEvent.fruit,
                    createdAt: farmEvent.createdAt
                });
                land[farmEvent.landIndex] = plantedSeed;
            } else if (farmEvent.action == Action.Harvest) {
                Square memory square = land[farmEvent.landIndex];
                require(square.fruit == farmEvent.fruit, "No fruit exists at this field");

                // Currently seconds
                uint duration = farmEvent.createdAt - square.createdAt;
                uint hoursToHarvest = getHarvestHours(farmEvent.fruit);
                string memory durationString = uint2str(hoursToHarvest - duration);
                string memory message = concatenate("The fruit is not ripe, please wait: ", durationString);
                require(duration >= hoursToHarvest, message);

                // Clear the land
                Square memory emptyLand = Square({
                    fruit: Fruit.None,
                    createdAt: 0
                });
                land[farmEvent.landIndex] = emptyLand;

                uint price = getFruitPrice(farmEvent.fruit);
                uint fmcPrice = getMarketPrice(price);

                balance = balance.add(fmcPrice);
            }
        }

        return Farm({
            land: land,
            balance: balance
        });
    }


    function sync(Event[] memory _events) public hasFarm returns (Farm memory) {
        uint balance = token.balanceOf(msg.sender);
        Farm memory farm = buildFarm(_events);

        // Update the land
        Square[] storage land = fields[msg.sender];
        for (uint i=0; i < farm.land.length; i += 1) {
            land[i] = farm.land[i];
        }


        // Update the balance - mint or burn
        if (farm.balance > balance) {
            uint profit = farm.balance.sub(balance);
            token.mint(msg.sender, profit);
        } else if (farm.balance < balance) {
            uint loss = balance.sub(farm.balance);
            token.burn(msg.sender, loss);
        }

        syncedAt[msg.sender] = block.timestamp;

        emit FarmSynced(msg.sender);
        return farm;
    }

    function levelUp() public hasFarm {
        require(fields[msg.sender].length <= 17, "You are at the maximum level");

        Square[] storage land = fields[msg.sender];

        uint conversion = getMarketRate();

        uint price = getLandPrice(land.length);
        uint fmcPrice = getMarketPrice(price);
        string memory priceString = uint2str(fmcPrice);
        string memory message = concatenate("Not enough money to level up: ", priceString);

        uint balance = token.balanceOf(msg.sender);
        require(balance >= fmcPrice, message);

        Square memory empty = Square({
            fruit: Fruit.None,
            createdAt: block.timestamp
        });

        // Do not bother rearranging the array - it is already in a strange square - Add 3 fields
        for (uint index = 0; index < 3; index++) {
            land.push(empty);
        }

        token.burn(msg.sender, fmcPrice);

        // Land tax - An additional 5% of profit goes to developers & designers of Fruit Market
        uint commission = fmcPrice / 5;
        token.mint(token.getOwner(), commission);

        emit FarmSynced(msg.sender);
    }

    // How many FMC do you get per dollar
    function getMarketRate() private view returns (uint conversion) {
        uint decimals = token.decimals();
        uint totalSupply = token.totalSupply();

        // Less than 100, 000 FMC tokens
        if (totalSupply < (1000000 * 10**decimals)) {
            // 1 Farm Dollar gets you a FMC token
            return 1;
        }

        // Less than 1, 000, 000 FMC tokens
        if (totalSupply < (10000 * 10**decimals)) {
            return 10;
        }
        // Less than 10, 000, 000 FMC tokens
        if (totalSupply < (100000 * 10**decimals)) {
            return 100;
        }

        // Less than 100, 000, 000 FMC tokens
        if (totalSupply < (100000 * 10**decimals)) {
            return 1000;
        }

        // Less than 1, 000, 000, 000 FMC tokens
        if (totalSupply < (100000 * 10**decimals)) {
            return 10000;
        }

        // 1 Farm Dollar gets you a 0.00001 of FMC
        //return 10**(decimals-5);
        return 100000;
    }

    function getMarketPrice(uint price) public view returns (uint conversion) {
        uint marketRate = getMarketRate();

        return price / marketRate;
    }



    // // Append a event to the list
    // function addEvent(Event[] memory _events, Event memory _event) private view returns (Event[] memory) {
    //     Event[] memory newEvents = new Event[](_events.length + 1);
    //     for (uint i=0; i < _events.length; i += 1) {
    //         newEvents[i] = _events[i];
    //     }

    //     // Add the new event
    //     newEvents[_events.length] = _event;

    //     return newEvents;
    // }

    // function plant(Event[] memory _events, Fruit _fruit, uint landIndex) public hasFarm view returns (Farm memory farm) {
    //     Event memory plantAppleEvent = Event({
    //         action: Action.Plant,
    //         fruit: _fruit,
    //         landIndex: landIndex,
    //         createdAt: block.timestamp
    //     });
    //     Event[] memory newEvents = addEvent(_events, plantAppleEvent);

    //     Farm memory updatedFarm = buildFarm(newEvents);
    //     return (updatedFarm);
    // }

    // function harvest(Event[] memory _events, Fruit _fruit, uint landIndex) public hasFarm view returns (Farm memory farm) {
    //     // Add the new event
    //     Event memory plantAppleEvent = Event({
    //         action: Action.Harvest,
    //         fruit: _fruit,
    //         landIndex: landIndex,
    //         createdAt: block.timestamp
    //     });
    //     Event[] memory newEvents = addEvent(_events, plantAppleEvent);

    //     Farm memory updatedFarm = buildFarm(newEvents);
    //     return (updatedFarm);
    // }
}