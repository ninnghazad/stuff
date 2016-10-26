(function () {

  var O = othello;
  var brain;
  $.getScript('http://cs.stanford.edu/people/karpathy/convnetjs/build/convnet-min.js', function(d)
  {
      console.log("convnet loaded",d);
      brain = new deepqlearn.Brain(64, 64);  
      console.log("brain created");
  });
  /*
  var state = [Math.random(), Math.random(), Math.random()];
  for(var k=0;k<10000;k++) {
      var action = brain.forward(state); // returns index of chosen action
      var reward = action === 0 ? 1.0 : 0.0;
      brain.backward([reward]); // <-- learning magic happens here
      state[Math.floor(Math.random()*3)] += Math.random()*2-0.5;
  }*/
  brain.epsilon_test_time = 0.0; // don't make any more random choices
  brain.learning = false;
  // get an optimal action from the learned policy
  //var action = brain.forward(array_with_num_inputs_numbers);
  
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
