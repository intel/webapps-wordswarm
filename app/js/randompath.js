/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the 
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */


//  The purpose of this module is to find a random path that
//  covers the entire game board.
//
// The wordswarm game board:
//     3    10
//  0     7    14
//     4    11
//  1     8    15
//     5    12
//  2     9    16
//     6    13

function RandomPath() {
    this.adj = [[1, 4, 3], [0, 4, 5, 2], [1, 5, 6], [0, 4, 7],
                [0, 3, 7, 8, 5, 1], [1, 4, 8, 9, 6, 2], [2, 5, 9],
                [3, 10, 11, 8, 4], [4, 7, 11, 12, 9, 5], 
                [5, 8, 12, 13, 6], [7, 11, 14], [7, 10, 14, 15, 12, 8],
                [8, 11, 15, 16, 13, 9], [9, 12, 16], [10, 11, 15],
                [14, 11, 12, 16], [13, 12, 15]];
    this.path = [];
}

RandomPath.prototype.nextMove = function(idx)
{
    /* if we got to 16, we succeeded */
    if(idx > 16)
    {
        return true;
    }

    var i;
    var last = this.path[idx-1];
    var adjfilter = [];
    var nextposs = [];

    /* make a copy of adjacencies filtering out used nodes */
    for(i = 0; i < this.adj[last].length; i++)
    {
        if(this.path.indexOf(this.adj[last][i]) < 0)
        {
            adjfilter[adjfilter.length] = this.adj[last][i];
        }
    }

    /* if there are no nodes left, we've failed */
    if(adjfilter.length <= 0)
    {
        return false;
    }

    /* randomize the adjacent nodes */
    while(adjfilter.length > 0)
    {
        var n = Math.floor(Math.random() * adjfilter.length);
        nextposs[nextposs.length] = adjfilter.splice(n, 1)[0];
    }

    /* check all possible adjacencies */
    for(i = 0; i < nextposs.length; i++)
    {
        this.path[idx] = nextposs[i];
        if(this.nextMove(idx+1))
        {
            return true;
        }
    }

    /* this node is a dead end */
    this.path.splice(idx, 1);
    return false;
}

RandomPath.prototype.generatePath = function()
{
    var n = Math.floor(Math.random() * 17);
    this.path = [];
    this.path[0] = n;
    this.nextMove(1);
    return this.path;
}
