(function () {
  // https://rawgit.com/ninnghazad/stuff/master/ai.js
  var O = othello;
  var env = {};
  env.getNumStates = function() { return 64; }
  env.getMaxNumActions = function() { return 64; }

  var spec = {}
  spec.update = 'qlearn'; // qlearn | sarsa
  spec.gamma = 0.9; // discount factor, [0, 1)
  spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
  spec.alpha = 0.005; // value function learning rate
  spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
  spec.experience_size = 5000; // size of experience
  spec.learning_steps_per_iteration = 20;
  spec.tderror_clamp = 1.0; // for robustness
  spec.num_hidden_units = 64*64 // number of neurons in hidden layer

  var agent;
  

  $.getScript('https://rawgit.com/andris9/jStorage/master/jstorage.js', function() {
  $.getScript('https://rawgit.com/karpathy/reinforcejs/master/lib/rl.js', function()
  {
      console.log("convnet loaded",d);
      agent = new RL.DQNAgent(env, spec); 
      
      var json = $.jStorage.get("agent",null);
  
      if(json != null) {
        
        agent.fromJSON(json);
        agent.epsilon = 0.05;
        //agent.alpha = 0;
        
        console.log("agent loaded");
      } else {
        console.log("new agent created");
      }
      
  })});
  
  
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
      //console.log(score,gameTree,stateBoard(gameTree.board,gameTree.player),O);
      var bestMove = 0;
      if(gameTree.moves.length < 1) {
        return false;
      } else if(gameTree.moves.length == 1) {
        return gameTree.moves[0];
      }
      var tries = 0;
      while(true) {
        ++tries;
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
          var reward = newScore - score;
          console.log(gameTree.player+" # reward: "+reward+" after "+tries+" tries, score: "+newScore);
          agent.learn(newScore - score);
          break;
        } else {
          // bad AI ! *snoutwhack*
          agent.learn(-1);
        }
      }
      
      $.jStorage.set("agent",agent.toJSON());
      return gameTree.moves[bestMove]
    }
  });
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
