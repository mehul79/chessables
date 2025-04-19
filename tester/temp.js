import { Chess } from "chess.js"
const chess = new Chess()

// make some moves
// chess.move('e4')
// chess.move('e5')
// chess.move('f3')
// chess.move('Nf6')

const board = chess.ascii()
// console.log(board);
// console.log(chess.history({ verbose: true }));


// -> '   +------------------------+
//      8 | r  n  b  q  k  b  n  r |
//      7 | p  p  p  p  .  p  p  p |
//      6 | .  .  .  .  .  .  .  . |
//      5 | .  .  .  .  p  .  .  . |
//      4 | .  .  .  .  P  P  .  . |
//      3 | .  .  .  .  .  .  .  . |
//      2 | P  P  P  P  .  .  P  P |
//      1 | R  N  B  Q  K  B  N  R |
//        +------------------------+
//          a  b  c  d  e  f  g  h'


console.log(chess.moves())
console.log(chess.move("e4"));

console.log(chess.turn());
