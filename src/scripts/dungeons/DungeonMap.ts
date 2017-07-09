class DungeonMap {
    size: number;
    board: KnockoutObservable<DungeonTile[][]>;
    playerPosition: KnockoutObservable<Point>;


    constructor(size: number) {
        this.size = size;
        this.board = ko.observable(this.generateMap());

        this.playerPosition = ko.observable(new Point(Math.floor(size / 2), size - 1));

        // Move the boss if it spawns on the player.
        if( this.currentTile().type() == GameConstants.DungeonTile.boss){
            this.currentTile().type(GameConstants.DungeonTile.empty);
            let newX = GameConstants.randomIntBetween(0,size-2);
            let newY = GameConstants.randomIntBetween(0,size-2);
            this.board()[newY][newX].type(GameConstants.DungeonTile.boss);
            this.board()[newY][newX].calculateCssClass();
        }
        this.currentTile().isVisible = true;
        this.currentTile().type(GameConstants.DungeonTile.empty);
        this.currentTile().hasPlayer = true;
        this.currentTile().calculateCssClass();
    }



    public moveToCoordinates(x:number, y:number){
        this.moveToTile(new Point(x, y));
    }

    public moveToTile(point:Point){
        if(this.hasAccesToTile(point)){
            this.currentTile().hasPlayer = false;
            this.currentTile().calculateCssClass();
            this.playerPosition(point);
            this.currentTile().hasPlayer = true;
            this.currentTile().isVisible = true;
            this.currentTile().calculateCssClass();
            if(this.currentTile().type() == GameConstants.DungeonTile.enemy){
                DungeonBattle.generateNewEnemy();
            }

        }
    }

    public currentTile() : DungeonTile {
        return this.board()[this.playerPosition().y][this.playerPosition().x];
    }

    public hasAccesToTile(point:Point){
        if(DungeonRunner.fighting()){
            return false;
        }
        //If any of the adjacent Tiles is visited, it's a valid Tile.
        if(point.x < 0 || point.x >= this.size || point.y < 0 || point.y >= this.size){
            return false
        }

        // If the point is visible, we can move there.
        if(this.board()[point.y][point.x].isVisible){
            return true;
        }

        if(point.y < this.size-1 &&this.board()[point.y+1][point.x].isVisible){
            return true;
        }

        if(point.y > 0 && this.board()[point.y-1][point.x].isVisible){
            return true;
        }

        if(point.x < this.size-1 && this.board()[point.y][point.x+1].isVisible){
            return true;
        }

        if(point.x > 0 && this.board()[point.y][point.x-1].isVisible){
            return true;
        }
        return false;
    }

    public generateMap() {
        // Fill mapList with required Tiles
        let mapList: DungeonTile[] = [];

        mapList.push(new DungeonTile(GameConstants.DungeonTile.boss));
        for (let i: number = 0; i < this.size; i++) {
            mapList.push(new DungeonTile(GameConstants.DungeonTile.chest));
        }

        for (let i: number = 0; i < this.size * 2; i++) {
            mapList.push(new DungeonTile(GameConstants.DungeonTile.enemy));
        }

        for (let i: number = mapList.length; i < this.size * this.size; i++) {
            mapList.push(new DungeonTile(GameConstants.DungeonTile.empty));
        }

        // Shuffle the tiles randomly
        this.shuffle(mapList);

        // Create a 2d array
        let map: DungeonTile[][] = [];
        while (mapList.length) {
            map.push(mapList.splice(0, this.size));
        }
        return map;
    }


    /**
     * Shuffles array in place.
     * @param {Array} a items The array containing the items.
     */
    public shuffle(a) {
        let j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }
}