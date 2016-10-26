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
      console.log(gameTree,stateBoard(gameTree.board),O);
      //while(true) {
        var action = agent.act(stateBoard(gameTree.board));
        //if(
      //}
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
