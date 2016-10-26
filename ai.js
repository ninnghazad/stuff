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
  });
  
  
  function sum(ns) {
    return ns.reduce(function (t, n) {return t + n;});
  }

  function scoreBoard(board, player) {
    var opponent = O.nextPlayer(player);
    return sum($.map(board, function (v) {return v == player;})) -
           sum($.map(board, function (v) {return v == opponent;}));
  }

  O.registerAI({
    findTheBestMove: function (gameTree) {
      var scores =
        gameTree.moves.map(function (m) {
          return scoreBoard(O.force(m.gameTreePromise).board, gameTree.player);
        });
      var maxScore = Math.max.apply(null, scores);
      return gameTree.moves[scores.indexOf(maxScore)]
    }
  });
})();
// vim: expandtab softtabstop=2 shiftwidth=2 foldmethod=marker
