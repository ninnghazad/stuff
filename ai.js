(function () {

  var O = othello;
  var env = {};
  env.getNumStates = function() { return 64; }
  env.getMaxNumActions = function() { return 64; }

  // create the DQN agent
  var spec = { alpha: 0.01 } // see full options on DQN page
  var agent;
  

  $.getScript('https://rawgit.com/karpathy/reinforcejs/master/lib/rl.js', function(d)
  {
      console.log("convnet loaded",d);
      agent = new RL.DQNAgent(env, spec); 
      console.log("agent created");
    
    /*
      $.getJSON( "agentzoo/wateragent.json", function( data ) {
        var agent = w.agents[0].brain;
        agent.fromJSON(data); // corss your fingers...
        // set epsilon to be much lower for more optimal behavior
        agent.epsilon = 0.05;
        $("#slider").slider('value', agent.epsilon);
        $("#eps").html(agent.epsilon.toFixed(2));
        // kill learning rate to not learn
        agent.alpha = 0;
      });
    */
  });
  
  
  function sum(ns) {
    return ns.reduce(function (t, n) {return t + n;});
  }

  function scoreBoard(board, player) {
    var opponent = O.nextPlayer(player);
    return sum($.map(board, function (v) {return v == player;})) -
           sum($.map(board, function (v) {return v == opponent;}));
  }
  
  function stateBoard(board, player) {
    var opponent = O.nextPlayer(player);
    return $.map(board, function (v) {return (v == player?1:(v == opponent?-1:0));});
  }

  O.registerAI({
    findTheBestMove: function (gameTree) {
      var score = scoreBoard(gameTree.board, gameTree.player);
      console.log(score,gameTree,stateBoard(gameTree.board,gameTree.player),O);
      var bestMove = 0;
      if(gameTree.moves.length < 1) {
        return false;
      } else if(gameTree.moves.length == 1) {
        return gameTree.moves[0];
      }
      while(true) {
        var action = agent.act(stateBoard(gameTree.board,gameTree.player));
        var x = action % 8;
        var y = (action - x) / 8;
        var move;
        var legalMove = false;
        for(var i in gameTree.moves) {
            move = gameTree.moves[i];
            if(move.x == x && move.y == y) {
                bestMove = i;
                legalMove = true;
                break;
            }
        }
        if(legalMove) {
          var newScore = scoreBoard(O.force(move.gameTreePromise).board, gameTree.player);
          agent.learn(newScore - score);
          break;
        } else {
          agent.learn(-1);
        }
      }
      console.log(agent.toJSON());
      return gameTree.moves[bestMove]
    }
  });
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
