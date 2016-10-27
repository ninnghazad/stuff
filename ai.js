(function () {
  // https://rawgit.com/ninnghazad/stuff/master/ai.js
  var O = othello;
  var env = {};
  var moves = [];
  env.getNumStates = function() { return 64; }
  env.getMaxNumActions = function() { return 64; }
  env.allowedActions = function() {
      return $.map(moves,function (v) {
          return v.y * 8 + v.x;
      });
  }
  var spec = {}
  spec.update = 'qlearn'; // qlearn | sarsa
  spec.gamma = 0.9; // discount factor, [0, 1)
  spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
  spec.alpha = 0.005; // value function learning rate
  //spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
  spec.experience_size = 10000; // size of experience
  spec.learning_steps_per_iteration = 20;
  spec.tderror_clamp = 1.0; // for robustness
  spec.num_hidden_units = 64+3 // number of neurons in hidden layer

  var agent;
  var counter = 0;

  $.getScript('https://rawgit.com/pieroxy/lz-string/master/libs/lz-string.min.js', function() {
  $.getScript('https://rawgit.com/andris9/jStorage/master/jstorage.js', function() {
  $.getScript('https://rawgit.com/karpathy/reinforcejs/master/lib/rl.js', function()
  {
      console.log("convnet loaded");
      agent = new RL.DQNAgent(env, spec); 
      
      var json = $.jStorage.get("agent",null);
      
      if(json !== null) {
        console.log("agent decompressing: "+json.length+" bytes");
        json = LZString.decompressFromUTF16(json);
        console.log("agent parse: "+json.length+" bytes");
        json = JSON.parse(json);
        try {
          agent.fromJSON(json);
          //agent.epsilon = 0.05;
          //agent.alpha = 0;
        } catch (err) {
          $.jStorage.deleteKey("agent");    
        }
        
        console.log("agent loaded: "+json.length+" bytes");
      } else {
        console.log("new agent created");
      }
      delete json;
  })})});
  
  
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
      moves = gameTree.moves;
      console.log(gameTree.player+": "+moves.length+" moves, "+env.allowedActions().length+" actions.");
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
          agent.learn(-100);
        }
      }
      
      if(counter % 100 == 0) {
        var json = LZString.compressToUTF16(JSON.stringify(agent.toJSON()));
        console.log("agent: "+json.length);
        $.jStorage.set("agent",json);
      }
      counter++;
      return gameTree.moves[bestMove]
    }
  });
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
