/**
 * Self-check for SocketManager room bookkeeping.
 * Run: npx ts-node src/socketManager.check.ts
 */
import assert from "assert";
import { socketManager, User } from "./SocketManager";

const OPEN = 1;
const CLOSED = 3;

function fakeSocket(readyState = OPEN) {
  return { readyState, sent: [] as string[], send(m: string) { this.sent.push(m); } };
}

function makeUser(userId: string, socket: any) {
  return new User(socket, { userId, name: userId } as any);
}

// 1. A stale socket closing must NOT evict the same user's live socket.
//    (white navigates lobby -> game room; the lobby socket closes late)
{
  const room = "room-nav";
  const lobbySock = fakeSocket();
  const gameSock = fakeSocket();
  const white = makeUser("white", lobbySock);
  const whiteAgain = makeUser("white", gameSock);
  const black = makeUser("black", fakeSocket());

  socketManager.addUser(white, room);
  socketManager.addUser(black, room);
  socketManager.addUser(whiteAgain, room); // JOIN_GAME from the new socket

  lobbySock.readyState = CLOSED;
  socketManager.removeUser(white); // late close event for the stale socket

  socketManager.broadcast(room, "move-1");
  assert.deepStrictEqual(gameSock.sent, ["move-1"], "live socket lost its room slot");
  assert.strictEqual(lobbySock.sent.length, 0, "stale socket should get nothing");
}

// 2. One dead socket must not abort delivery to the rest of the room.
{
  const room = "room-dead";
  const dead = fakeSocket(CLOSED);
  dead.send = () => { throw new Error("socket is closed"); };
  const liveSock = fakeSocket();

  socketManager.addUser(makeUser("ghost", dead), room);
  socketManager.addUser(makeUser("live", liveSock), room);

  socketManager.broadcast(room, "move-2");
  assert.deepStrictEqual(liveSock.sent, ["move-2"], "dead socket aborted the broadcast");
}

// 3. Last socket leaving cleans the room up.
{
  const room = "room-empty";
  const sock = fakeSocket();
  const solo = makeUser("solo", sock);
  socketManager.addUser(solo, room);
  socketManager.removeUser(solo);
  socketManager.broadcast(room, "should-not-arrive");
  assert.strictEqual(sock.sent.length, 0, "removed user still received a broadcast");
}

console.log("SocketManager checks passed");
