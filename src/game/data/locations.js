// Generatory map i lokacji
export class MapGenerator {
    static generateDungeon(width, height, roomCount = 8) {
        const map = this.createEmptyMap(width, height);
        const rooms = [];

        // Generuj pokoje
        for (let i = 0; i < roomCount; i++) {
            const room = this.generateRoom(width, height);
            if (!this.roomOverlaps(room, rooms)) {
                rooms.push(room);
                this.carveRoom(map, room);
            }
        }

        // Połącz pokoje korytarzami
        for (let i = 0; i < rooms.length - 1; i++) {
            this.createCorridor(map, rooms[i], rooms[i + 1]);
        }

        return { map, rooms };
    }

    static createEmptyMap(width, height) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = 'wall';
            }
        }
        return map;
    }

    static generateRoom(mapWidth, mapHeight) {
        const width = Math.floor(Math.random() * 6) + 4;
        const height = Math.floor(Math.random() * 6) + 4;
        const x = Math.floor(Math.random() * (mapWidth - width - 2)) + 1;
        const y = Math.floor(Math.random() * (mapHeight - height - 2)) + 1;

        return { x, y, width, height };
    }

    static roomOverlaps(room, rooms) {
        for (let otherRoom of rooms) {
            if (
                room.x < otherRoom.x + otherRoom.width + 1 &&
                room.x + room.width + 1 > otherRoom.x &&
                room.y < otherRoom.y + otherRoom.height + 1 &&
                room.y + room.height + 1 > otherRoom.y
            ) {
                return true;
            }
        }
        return false;
    }

    static carveRoom(map, room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                map[y][x] = 'floor';
            }
        }
    }

    static createCorridor(map, room1, room2) {
        const x1 = Math.floor(room1.x + room1.width / 2);
        const y1 = Math.floor(room1.y + room1.height / 2);
        const x2 = Math.floor(room2.x + room2.width / 2);
        const y2 = Math.floor(room2.y + room2.height / 2);

        // Korytarz w kształcie L
        if (Math.random() < 0.5) {
            // Najpierw poziomo, potem pionowo
            this.carveHorizontal(map, x1, x2, y1);
            this.carveVertical(map, y1, y2, x2);
        } else {
            // Najpierw pionowo, potem poziomo
            this.carveVertical(map, y1, y2, x1);
            this.carveHorizontal(map, x1, x2, y2);
        }
    }

    static carveHorizontal(map, x1, x2, y) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        for (let x = start; x <= end; x++) {
            if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                map[y][x] = 'floor';
            }
        }
    }

    static carveVertical(map, y1, y2, x) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        for (let y = start; y <= end; y++) {
            if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                map[y][x] = 'floor';
            }
        }
    }

    static generateForest(width, height) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                const rand = Math.random();
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    map[y][x] = 'wall';
                } else if (rand < 0.15) {
                    map[y][x] = 'tree';
                } else if (rand < 0.2) {
                    map[y][x] = 'water';
                } else {
                    map[y][x] = 'grass';
                }
            }
        }
        return map;
    }

    static generateCave(width, height) {
        const map = this.createEmptyMap(width, height);

        // Algorytm cellular automata
        // Inicjalizacja losowa
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                map[y][x] = Math.random() < 0.45 ? 'floor' : 'wall';
            }
        }

        // Symulacja
        for (let iteration = 0; iteration < 5; iteration++) {
            const newMap = JSON.parse(JSON.stringify(map));
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const wallCount = this.countAdjacentWalls(map, x, y);
                    if (wallCount > 4) {
                        newMap[y][x] = 'wall';
                    } else if (wallCount < 4) {
                        newMap[y][x] = 'floor';
                    }
                }
            }
            Object.assign(map, newMap);
        }

        return map;
    }

    static countAdjacentWalls(map, x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ny = y + dy;
                const nx = x + dx;
                if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) {
                    count++;
                } else if (map[ny][nx] === 'wall') {
                    count++;
                }
            }
        }
        return count;
    }
}

// Lokacje w grze
export const LOCATIONS = {
    STARTING_VILLAGE: {
        id: 'starting_village',
        name: 'Wioska Początkowa',
        type: 'village',
        description: 'Spokojna wioska, gdzie rozpoczyna się twoja przygoda.',
        npcs: ['VILLAGE_ELDER', 'MERCHANT', 'BLACKSMITH']
    },

    DARK_FOREST: {
        id: 'dark_forest',
        name: 'Mroczny Las',
        type: 'forest',
        description: 'Gęsty las pełen niebezpieczeństw i tajemnic.',
        enemies: ['enemy_goblin', 'enemy_skeleton'],
        mapType: 'forest'
    },

    ABANDONED_RUINS: {
        id: 'abandoned_ruins',
        name: 'Opuszczone Ruiny',
        type: 'dungeon',
        description: 'Starożytne ruiny pełne pułapek i skarbów.',
        enemies: ['enemy_skeleton', 'enemy_orc'],
        mapType: 'dungeon'
    },

    MOUNTAIN_CAVE: {
        id: 'mountain_cave',
        name: 'Górska Jaskinia',
        type: 'cave',
        description: 'Ciemna jaskinia w górach, legowisko trolli.',
        enemies: ['enemy_troll', 'enemy_orc'],
        boss: 'boss_troll_king',
        mapType: 'cave'
    },

    DRAGON_LAIR: {
        id: 'dragon_lair',
        name: 'Smocza Jama',
        type: 'boss_lair',
        description: 'Legowisko starożytnego smoka.',
        boss: 'boss_ancient_dragon',
        mapType: 'cave'
    }
};

const locationData = { MapGenerator, LOCATIONS };
export default locationData;
