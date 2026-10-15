const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const ALL_CHARACTERS = [
  { id: "abigail", name: "Abigail Williams", th: "อาบิเกล วิลเลียมส์", desc: "เมื่อใส่ความผู้เล่นจนได้หงายการ์ดไต่สวนของผู้เล่นคนนั้น สามารถลบล้าง(ทิ้ง) ข้อกล่าวหาทั้งหมดที่อยู่หน้าตัวเองได้" },
  { id: "ann", name: "Ann Putnam", th: "แอนน์ พุตแนม", desc: "เมื่อใส่ความผู้เล่นจนได้หงายการ์ดไต่สวนของผู้เล่นคนนั้น ก่อนเลือกหงายการ์ด สามารถจั่วการ์ดได้ 2 ใบ และยังอยู่ในตาเล่นต่อ" },
  { id: "cotton", name: "Cotton Mather", th: "คอตตอน เมเธอร์", desc: "การ์ด 'หลักฐาน' ที่เล่นใส่คุณจะถูกนับเป็น 1 ข้อกล่าวหาเท่านั้น (จากเดิม 3)" },
  { id: "giles", name: "Giles Corey", th: "ไจลส์ คอรีย์", desc: "ถ้าจั่วได้การ์ด 'ข้อกล่าวหา' 2 ใบพร้อมกัน (ไม่รวมการ์ด 'พยาน' หรือ 'หลักฐาน') แสดงการ์ด 2 ใบนั้นให้ผู้เล่นอื่นดู และจั่วการ์ดเพิ่มอีกใบ" },
  { id: "martha", name: "Martha Corey", th: "มาร์ธา คอรีย์", desc: "มีความสามารถเหมือนผู้เล่นคนถัดไปทางขวามือที่ยังอยู่ในเกม" },
  { id: "george", name: "George Burroughs", th: "จอร์จ เบอร์โรวส์", desc: "ต้องถูกใส่ความ 8 ข้อกล่าวหา ถึงจะถูกเปิดการ์ดไต่สวน" },
  { id: "john", name: "John Proctor", th: "จอห์น พรอคเตอร์", desc: "เมื่อมีผู้เล่นตาย จะได้รับการ์ดสีน้ำเงินที่อยู่ด้านหน้าและการ์ดบนมือทั้งหมดของผู้เล่นคนนั้น โดยนำการ์ดทั้งหมดขึ้นมือ" },
  { id: "mary", name: "Mary Warren", th: "แมรี่ วอร์เรน", desc: "ไม่ได้รับผลจากการ์ด 'แม่สื่อ' และ 'แมวดำ'" },
  { id: "rebecca", name: "Rebecca Nurse", th: "รีเบคก้า เนิร์ส", desc: "ทุกครั้งที่มีการหงายการ์ดไต่สวนของผู้เล่นอื่น สามารถจั่วการ์ดได้ 1 ใบ (ไม่นับการ์ดที่หงายจากการตายหรือสารภาพบาปของผู้เล่น)" },
  { id: "samuel", name: "Samuel Parris", th: "แซมมูเอล แพร์ริส", desc: "จั่วการ์ด 2 ใบจากกองทิ้งแทนการจั่วจากการ์ดกองปกติ โดยห้ามหยิบการ์ดสีดำ (ใช้ได้ 2 ครั้งในเกม)" },
  { id: "sarah", name: "Sarah Good", th: "ซาราห์ กู้ด", desc: "การ์ด 'ปล้น' และ 'วางเพลิง' ที่เล่นใส่คุณจะไร้ผลและลงกองทิ้ง" },
  { id: "thomas", name: "Thomas Danforth", th: "โธมัส แดนฟอร์ธ", desc: "สามารถเลือกหงายการ์ดไต่สวนของผู้เล่นคนอื่นได้ทันที เมื่อผู้สวมบทบาทนี้ใส่ความผู้เล่นคนนั้นจนครบ 6 ข้อกล่าวหา (หรือ 7 หากเป็นจอร์จ เบอร์โรวส์)" },
  { id: "tituba", name: "Tituba", th: "ทิทูบา", desc: "ก่อนจั่วการ์ดคุณสามารถเรียงลำดับการ์ดในกองได้ ภายในเวลา 2 นาฬิกาทราย (ใช้ได้ 1 ครั้งในเกม ในเทิร์นของคุณเท่านั้น)" },
  { id: "will", name: "Will Griggs", th: "วิลล์ กริกส์", desc: "สามารถเล่นการ์ด 'ข้อแก้ต่าง' เสมือนเป็นการ์ด 'พยาน' ได้ (นับเป็น 7 ข้อกล่าวหา)" },
  { id: "william", name: "William Phips", th: "วิลเลียม ฟิปส์", desc: "สามารถ 'สารภาพ' โดยไม่ต้องหงายการ์ดไต่สวนได้ (ใช้ได้ 1 ครั้งในเกม)" }
];

const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function createInitialCharState() {
  return {
    samuelUsesLeft: 2,
    titubaUsesLeft: 1,
    phipsUsesLeft: 1,
    titubaUsedThisTurn: false
  };
}

// ตรวจสอบความสามารถจริงของผู้เล่น (รองรับ Martha Corey ที่เลียนแบบคนถัดไปทางขวามือที่ยังมีชีวิต)
function getEffectiveCharInfo(room, player) {
  if (!room || !room.options || !room.options.useCharacterAbilities || !player || !player.char) {
    return { id: null, charObj: null, copiedFromName: null };
  }
  if (player.char.id !== 'martha') {
    return { id: player.char.id, charObj: player.char, copiedFromName: null };
  }

  const players = room.players || [];
  const total = players.length;
  const myIdx = players.findIndex(p => p && p.socketId === player.socketId);
  if (myIdx === -1 || total <= 1) {
    return { id: 'martha', charObj: player.char, copiedFromName: null };
  }

  // คนถัดไปทางขวามือที่ยังมีชีวิตอยู่
  for (let step = 1; step < total; step++) {
    const rightP = players[(myIdx + step) % total];
    if (rightP && rightP.isAlive && rightP.socketId !== player.socketId && rightP.char) {
      return {
        id: rightP.char.id,
        charObj: rightP.char,
        copiedFromName: rightP.name
      };
    }
  }
  return { id: 'martha', charObj: player.char, copiedFromName: null };
}

function getEffectiveCharId(room, player) {
  return getEffectiveCharInfo(room, player).id;
}

function getAccusationThreshold(room, attacker, target) {
  const targetCharId = getEffectiveCharId(room, target);
  const attackerCharId = attacker ? getEffectiveCharId(room, attacker) : null;
  let threshold = (targetCharId === 'george') ? 8 : 7;
  if (attackerCharId === 'thomas') {
    threshold = (targetCharId === 'george') ? 7 : 6;
  }
  return threshold;
}

function getBasePlayableCards() {
  let deck = [];
  for (let i = 0; i < 35; i++) deck.push({ id: 'accusation', name: "Accusation (ข้อกล่าวหา)", type: "RED", val: 1, desc: "เพิ่มข้อกล่าวหา 1 คะแนน" });
  for (let i = 0; i < 5; i++) deck.push({ id: 'evidence', name: "Evidence (หลักฐานมืด)", type: "RED", val: 3, desc: "เพิ่มข้อกล่าวหา 3 คะแนน" });
  deck.push({ id: 'witness', name: "Witness (พยานบุคคล)", type: "RED", val: 7, desc: "เพิ่มข้อกล่าวหา 7 คะแนน (เปิดการ์ดทันที)" });

  deck.push({ id: 'robbery', name: "Robbery (ปล้น)", type: "GREEN", val: 0, desc: "ขโมยการ์ดในมือคนหนึ่งทั้งหมด ส่งให้อีกคน" });
  for (let i = 0; i < 3; i++) deck.push({ id: 'alibi', name: "Alibi (พยานแก้ต่าง)", type: "GREEN", val: 0, desc: "ลบล้างข้อกล่าวหาสูงสุด 3 คะแนน" });
  deck.push({ id: 'arson', name: "Arson (วางเพลิง)", type: "GREEN", val: 0, desc: "ทิ้งการ์ดบนมือของผู้เล่นเป้าหมายทั้งหมดลงกองทิ้ง" });
  for (let i = 0; i < 2; i++) deck.push({ id: 'scapegoat', name: "Scapegoat (แพะรับบาป)", type: "GREEN", val: 0, desc: "ย้ายการ์ดหน้าโต๊ะทั้งหมดจากคนหนึ่งไปให้อีกคน" });
  deck.push({ id: 'curse', name: "Curse (คำสาป)", type: "GREEN", val: 0, desc: "ทิ้งการ์ดสีน้ำเงินหน้าผู้เล่นอื่น 1 ใบ" });
  for (let i = 0; i < 3; i++) deck.push({ id: 'stocks', name: "Stocks (ขื่อคาลงทัณฑ์)", type: "BLUE", val: 0, desc: "ข้ามตาเล่นถัดไป 1 ครั้งแล้วทิ้ง" });

  deck.push({ id: 'asylum', name: "Asylum (ที่หลบภัย)", type: "BLUE", val: 0, desc: "คุ้มครองจากการถูกสังหารในคืน Night" });
  deck.push({ id: 'piety', name: "Piety (พลังศรัทธา)", type: "BLUE", val: 0, desc: "การ์ดสีแดงข้อกล่าวหาไม่มีผลกับผู้เล่นนี้" });
  for (let i = 0; i < 2; i++) deck.push({ id: 'matchmaker', name: "Matchmaker (แม่สื่อ)", type: "BLUE", val: 0, desc: "หากคนใดคนหนึ่งตาย อีกคนต้องตายตามทันที" });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function setupDeckWithSpecialCards(baseDeck) {
  let deck = [...baseDeck];
  const midIndex = Math.floor(deck.length / 2);
  deck.splice(midIndex, 0, { id: 'conspiracy', name: "Conspiracy (เจตนาร้าย)", type: "BLACK", desc: "เปิดการ์ดแมวดำ และสลับการ์ดเวียนซ้าย" });
  deck.unshift({ id: 'night', name: "Night (รัตติกาล)", type: "BLACK", desc: "ค่ำคืนล่าสังหารและวางค้อนคุ้มกัน" });
  return deck;
}

function buildTryalPool(playerCount, options) {
  let pool = [];
  let witches = (playerCount >= 6) ? 2 : 1;
  for (let i = 0; i < witches; i++) pool.push('WITCH');
  
  pool.push('CONSTABLE');

  const sp = (options && options.specialTryals) ? options.specialTryals : {};
  if (sp.charlatan) pool.push('CHARLATAN');
  if (sp.gravedigger) pool.push('GRAVEDIGGER');
  if (sp.inquisitor) pool.push('INQUISITOR');
  if (sp.pickpocket) pool.push('PICKPOCKET');

  while (pool.length < (playerCount * 5)) {
    pool.push('NOT_A_WITCH');
  }
  
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function addToDiscard(room, cards) {
  const toDiscard = Array.isArray(cards) ? cards : [cards];
  toDiscard.forEach(c => {
    if (c) room.discardPile.push(c);
  });
}

// ระบบคิวจั่วการ์ด (รองรับการจั่วเจอการ์ดดำ Conspiracy / Night แล้วกลับมาจั่วต่อจนครบ)
function enqueueDraws(room, playerId, count, reason) {
  if (!room.drawQueue) room.drawQueue = [];
  for (let i = 0; i < count; i++) {
    room.drawQueue.push({ playerId, reason });
  }
}

function processDrawQueue(room) {
  if (!room || checkVictory(room)) return;
  if (room.phase !== 'COURT') return;
  if (room.activeTryalEffect) return;

  while (room.drawQueue && room.drawQueue.length > 0) {
    const item = room.drawQueue.shift();
    const drawer = room.players.find(p => p.socketId === item.playerId);
    if (!drawer || !drawer.isAlive) continue;

    if (!room.deck || room.deck.length === 0) break;
    const card = room.deck.pop();

    if (card.id === 'conspiracy') {
      addToDiscard(room, [card]);
      broadcastLog(room.code, `⚡ **${drawer.name}** จั่วพบ **Conspiracy (เจตนาร้าย)!** เกมหยุดเพื่อทำเหตุการณ์ (จบแล้วจะจั่วส่วนที่เหลือต่อ)`);
      triggerConspiracyEvent(room);
      return; // หยุดคิวจั่วชั่วคราว เมื่อจบ Conspiracy จะกลับมาเรียก processDrawQueue ต่อ!
    } else if (card.id === 'night') {
      addToDiscard(room, [card]);
      broadcastLog(room.code, `🌑 **${drawer.name}** จั่วพบ **Night (รัตติกาล)!** กองจั่วหมดแล้ว เข้าสู่ค่ำคืนสังหาร`);
      handleNight(room);
      return; // หยุดคิวจั่วเพื่อเข้าสู่กลางคืน
    } else {
      drawer.hand.push(card);

      if (item.reason === 'REBECCA_SKILL') {
        broadcastLog(room.code, `✨ **${drawer.name}** (Rebecca Nurse) จั่วการ์ด 1 ใบจากการที่มีการ์ดไต่สวนของผู้อื่นถูกเปิดเผย!`);
      } else if (item.reason === 'ANN_SKILL') {
        broadcastLog(room.code, `✨ **${drawer.name}** (Ann Putnam) จั่วการ์ดโบนัส 1 ใบเข้ามือ!`);
      } else if (item.reason === 'GILES_BONUS') {
        broadcastLog(room.code, `✨ **${drawer.name}** (Giles Corey) ได้รับการ์ดโบนัสใบที่ 3 เข้ามือเรียบร้อย!`);
      } else if (item.reason === 'NORMAL_DRAW') {
        if (room.gilesDrawTracker && room.gilesDrawTracker.playerId === drawer.socketId) {
          room.gilesDrawTracker.cards.push(card);
          if (room.gilesDrawTracker.cards.length === 2) {
            const c1 = room.gilesDrawTracker.cards[0];
            const c2 = room.gilesDrawTracker.cards[1];
            room.gilesDrawTracker = null;
            if (getEffectiveCharId(room, drawer) === 'giles' && c1.id === 'accusation' && c2.id === 'accusation') {
              broadcastLog(room.code, `✨ **${drawer.name}** (Giles Corey) จั่วได้การ์ด **"ข้อกล่าวหา (+1)" 2 ใบพร้อมกัน!** แสดงการ์ดทั้ง 2 ใบให้ทุกคนดู และได้จั่วการ์ดเพิ่มอีก 1 ใบ!`);
              room.drawQueue.unshift({ playerId: drawer.socketId, reason: 'GILES_BONUS' });
            }
          }
        }
      }
    }
  }

  // เมื่อจั่วครบทุกใบในคิวแล้ว เช็คต่อว่ามีคิวการ์ดไต่สวนพิเศษ หรือคิวเลือกเปิดไพ่เหยื่อ หรือคิวจบเทิร์นรออยู่หรือไม่
  if (room.tryalEffectQueue && room.tryalEffectQueue.length > 0) {
    broadcastCourtUpdate(room);
    processNextTryalEffect(room);
    return;
  }

  if (room.pendingVictimPick) {
    const pick = room.pendingVictimPick;
    room.pendingVictimPick = null;
    const attacker = room.players.find(p => p.socketId === pick.attackerId);
    const target = room.players.find(p => p.socketId === pick.targetId);
    broadcastCourtUpdate(room);
    if (attacker && attacker.isAlive && target && target.isAlive && target.tryals.some(t => t && !t.revealed)) {
      io.to(attacker.socketId).emit('prompt_pick_victim_tryal', {
        targetSocketId: target.socketId,
        targetName: target.name,
        tryals: target.tryals.map((t, idx) => ({ index: idx, revealed: t.revealed }))
      });
      return;
    }
  }

  if (room.postDrawTurnEnd) {
    room.postDrawTurnEnd = false;
    broadcastCourtUpdate(room);
    passNextTurn(room);
    return;
  }

  broadcastCourtUpdate(room);
}

io.on('connection', (socket) => {

  socket.on('create_room', ({ playerName }) => {
    const code = generateRoomCode();
    socket.join(code);
    rooms[code] = {
      code,
      hostId: socket.id,
      options: {
        useCharacterAbilities: true,
        specialTryals: { charlatan: false, gravedigger: false, inquisitor: false, pickpocket: false }
      },
      players: [{
        socketId: socket.id,
        name: playerName || "ผู้นำศาล",
        isHost: true,
        char: ALL_CHARACTERS[0],
        charState: createInitialCharState(),
        isAlive: true,
        tryals: [],
        hand: [],
        redPoints: 0,
        redCardsOnTable: [],
        blueCards: [],
        isWitch: false,
        witchRank: null,
        isConfessed: false
      }],
      deck: [],
      discardPile: [],
      activePlayerIdx: 0,
      blackCatOwnerId: null,
      turnActionTaken: null,
      phase: 'LOBBY',
      nightSubPhase: null,
      nightTargetId: null,
      gavelTargetId: null,
      previousGavelTargetId: null,
      confessionCountdownTimer: null,
      nightActionTimer: null,
      conspiracyTimer: null,
      conspiracySelections: {},
      tryalEffectQueue: [],
      activeTryalEffect: null,
      tryalEffectTimer: null,
      afterTryalQueueCallback: null,
      drawQueue: [],
      gilesDrawTracker: null,
      pendingVictimPick: null,
      postDrawTurnEnd: false,
      titubaTimer: null,
      pendingCurse: null,
      gameLog: []
    };

    socket.emit('joined_room', { code, isHost: true, options: rooms[code].options });
    io.to(code).emit('update_room', rooms[code]);
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase();
    const room = rooms[code];
    if (!room) return socket.emit('error_msg', 'ไม่พบรหัสห้องนี้');
    if (room.players.length >= 12) return socket.emit('error_msg', 'ห้องศาลเต็มแล้ว');

    socket.join(code);
    const assignedChar = ALL_CHARACTERS[room.players.length % ALL_CHARACTERS.length];
    room.players.push({
      socketId: socket.id,
      name: playerName || `ชาวเมือง ${room.players.length + 1}`,
      isHost: false,
      char: assignedChar,
      charState: createInitialCharState(),
      isAlive: true,
      tryals: [],
      hand: [],
      redPoints: 0,
      redCardsOnTable: [],
      blueCards: [],
      isWitch: false,
      witchRank: null,
      isConfessed: false
    });

    socket.emit('joined_room', { code, isHost: false, options: room.options });
    io.to(code).emit('update_room', room);
  });

  socket.on('update_lobby_options', ({ roomCode, options }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;
    room.options = {
      ...room.options,
      ...options,
      specialTryals: {
        ...(room.options.specialTryals || {}),
        ...((options && options.specialTryals) || {})
      }
    };
    io.to(roomCode).emit('options_updated', room.options);
    io.to(roomCode).emit('update_room', room);
  });

  socket.on('start_game', ({ roomCode, options }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    if (options) {
      room.options = {
        ...room.options,
        ...options,
        specialTryals: {
          ...(room.options.specialTryals || {}),
          ...((options && options.specialTryals) || {})
        }
      };
    }

    // สุ่มตัวละครไม่ซ้ำกันให้ผู้เล่นทุกคนเมื่อเริ่มเกม
    const shuffledChars = [...ALL_CHARACTERS];
    for (let i = shuffledChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledChars[i], shuffledChars[j]] = [shuffledChars[j], shuffledChars[i]];
    }

    const tryalPool = buildTryalPool(room.players.length, room.options);
    let baseDeck = getBasePlayableCards();
    room.discardPile = [];
    room.gameLog = [];
    room.previousGavelTargetId = null;
    room.tryalEffectQueue = [];
    room.activeTryalEffect = null;
    room.afterTryalQueueCallback = null;
    room.drawQueue = [];
    room.gilesDrawTracker = null;
    room.pendingVictimPick = null;
    room.postDrawTurnEnd = false;

    let assignedWitches = [];
    room.players.forEach((p, idx) => {
      p.char = shuffledChars[idx % shuffledChars.length];
      p.charState = createInitialCharState();
      p.isAlive = true;
      p.redPoints = 0;
      p.redCardsOnTable = [];
      p.blueCards = [];
      p.isWitch = false;
      p.witchRank = null;
      p.isConfessed = false;

      p.tryals = tryalPool.splice(0, 5).map(t => ({ type: t, revealed: false }));
      if (p.tryals.some(t => t.type === 'WITCH')) {
        p.isWitch = true;
        assignedWitches.push(p);
      }
      p.hand = [baseDeck.pop(), baseDeck.pop(), baseDeck.pop()];
    });

    assignedWitches.forEach((w, index) => { w.witchRank = index + 1; });
    room.deck = setupDeckWithSpecialCards(baseDeck);

    const enabledSpecials = [];
    if (room.options.specialTryals.charlatan) enabledSpecials.push('Charlatan');
    if (room.options.specialTryals.gravedigger) enabledSpecials.push('Gravedigger');
    if (room.options.specialTryals.inquisitor) enabledSpecials.push('Inquisitor');
    if (room.options.specialTryals.pickpocket) enabledSpecials.push('Pickpocket');

    broadcastLog(room.code, `🏛️ **ศาลเปิดแล้ว!** ผู้เล่น ${room.players.length} คน (โหมดตัวละคร: **${room.options.useCharacterAbilities ? 'เปิด' : 'ปิด'}**, การ์ดพิเศษ: **${enabledSpecials.length > 0 ? enabledSpecials.join(', ') : 'ไม่มี'}**)`);
    runDawnSequence(room);
  });

  socket.on('witch_place_black_cat', ({ roomCode, targetSocketId }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const activeLead = getActiveLeadWitch(room);
    if (!activeLead || socket.id !== activeLead.socketId) return;

    const target = room.players.find(p => p.socketId === targetSocketId);
    if (!target) return;

    // ตรวจสอบ Mary Warren (ไม่ได้รับผลจากการ์ดแมวดำ)
    if (getEffectiveCharId(room, target) === 'mary') {
      return socket.emit('error_msg', `🛡️ ${target.name} (${target.char.th}) ไม่ได้รับผลจากการ์ดแมวดำ กรุณาเลือกผู้เล่นคนอื่น!`);
    }

    room.blackCatOwnerId = targetSocketId;
    target.blueCards.push({ 
      id: 'black_cat', 
      name: "Black Cat", 
      type: "BLUE",
      val: 0,
      desc: "ถือตราแมวดำ" 
    });
    
    room.activePlayerIdx = room.players.findIndex(p => p.socketId === targetSocketId);
    room.turnActionTaken = null;
    room.phase = 'COURT';

    broadcastLog(room.code, `🐈‍⬛ แม่มดตัดสินใจวาง **แมวดำ (Black Cat)** หน้าการ์ดของ **${target.name}**!`);
    io.to(room.code).emit('dawn_completed');
    broadcastCourtUpdate(room);
  });

  // จั่วปกติ 2 ใบแล้วจบเทิร์น (ผ่านระบบคิว รองรับ Giles Corey และการคั่นด้วยการ์ดดำ)
  socket.on('action_draw_two', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    if (room.activeTryalEffect) return socket.emit('error_msg', 'กรุณารอการใช้ความสามารถการ์ดไต่สวนให้เสร็จสิ้นก่อน!');
    
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return socket.emit('error_msg', 'ยังไม่ถึงเทิร์นของท่าน!');
    if (room.turnActionTaken === 'PLAYED') return socket.emit('error_msg', 'ท่านเลือกเล่นการ์ดแล้วในเทิร์นนี้');

    room.turnActionTaken = 'PLAYED';
    const current = room.players[pIdx];

    broadcastLog(room.code, `🎴 **${current.name}** เลือกจั่วการ์ด 2 ใบจากสำรับ`);
    room.gilesDrawTracker = { playerId: current.socketId, cards: [] };
    room.postDrawTurnEnd = true;
    enqueueDraws(room, current.socketId, 2, 'NORMAL_DRAW');
    processDrawQueue(room);
  });

  // สกิล Samuel Parris: เปิดดูและเลือกหยิบการ์ด 2 ใบจากกองทิ้งแทนการจั่วปกติ
  socket.on('samuel_request_discard_pile', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return socket.emit('error_msg', 'ยังไม่ถึงเทิร์นของท่าน!');
    if (room.turnActionTaken === 'PLAYED') return socket.emit('error_msg', 'ท่านเล่นการ์ดไปแล้วในเทิร์นนี้!');

    const current = room.players[pIdx];
    if (getEffectiveCharId(room, current) !== 'samuel') return socket.emit('error_msg', 'ท่านไม่ได้ถือความสามารถของ Samuel Parris!');
    if (!current.charState || current.charState.samuelUsesLeft <= 0) return socket.emit('error_msg', 'ท่านใช้ความสามารถของ Samuel Parris ครบ 2 ครั้งไปแล้ว!');

    const eligibleCards = (room.discardPile || [])
      .map((c, idx) => ({ card: c, discardIdx: idx }))
      .filter(item => item.card && item.card.type !== 'BLACK');

    if (eligibleCards.length < 2) {
      return socket.emit('error_msg', 'ในกองทิ้งมีการ์ดปกติ (ที่ไม่ใช่สีดำ) ไม่ถึง 2 ใบ ยังไม่สามารถใช้สกิลได้!');
    }

    socket.emit('prompt_samuel_discard_pick', {
      usesLeft: current.charState.samuelUsesLeft,
      cards: eligibleCards.map(item => ({
        discardIdx: item.discardIdx,
        id: item.card.id,
        name: item.card.name,
        type: item.card.type,
        val: item.card.val,
        desc: item.card.desc
      }))
    });
  });

  socket.on('samuel_confirm_discard_pick', ({ roomCode, selectedDiscardIndices }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return;
    if (room.turnActionTaken === 'PLAYED') return;

    const current = room.players[pIdx];
    if (getEffectiveCharId(room, current) !== 'samuel' || current.charState.samuelUsesLeft <= 0) return;

    const uniqueIndices = Array.from(new Set(selectedDiscardIndices || [])).map(Number);
    if (uniqueIndices.length !== 2) return socket.emit('error_msg', 'กรุณาเลือกการ์ดให้ครบ 2 ใบ!');

    // ตรวจสอบว่าการ์ดทั้ง 2 ใบมีอยู่จริงและไม่ใช่การ์ดสีดำ
    for (const idx of uniqueIndices) {
      const c = room.discardPile[idx];
      if (!c || c.type === 'BLACK') return socket.emit('error_msg', 'ไม่สามารถหยิบการ์ดสีดำได้!');
    }

    // เรียงจากมากไปน้อยเพื่อ splice ออกโดยไม่ให้ index เคลื่อน
    uniqueIndices.sort((a, b) => b - a);
    const pickedCards = [];
    uniqueIndices.forEach(idx => {
      pickedCards.push(room.discardPile.splice(idx, 1)[0]);
    });

    current.hand.push(...pickedCards);
    current.charState.samuelUsesLeft -= 1;
    room.turnActionTaken = 'PLAYED';

    broadcastLog(room.code, `♻️ **${current.name}** (Samuel Parris) ใช้สกิลเลือกหยิบการ์ด 2 ใบจากกองทิ้งขึ้นมือแล้วจบเทิร์น! (เหลือ ${current.charState.samuelUsesLeft}/2 ครั้ง)`);
    broadcastCourtUpdate(room);
    passNextTurn(room);
  });

  // สกิล Tituba: เปิดดูและจัดเรียงลำดับการ์ดในกองจั่วภายในเวลา 60 วินาที (1 ครั้งในเกม)
  socket.on('tituba_request_reorder', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return socket.emit('error_msg', 'ยังไม่ถึงเทิร์นของท่าน!');
    if (room.turnActionTaken === 'PLAYED') return socket.emit('error_msg', 'ต้องใช้ความสามารถก่อนจั่วหรือเล่นการ์ดเท่านั้น!');

    const current = room.players[pIdx];
    if (getEffectiveCharId(room, current) !== 'tituba') return socket.emit('error_msg', 'ท่านไม่ได้ถือความสามารถของ Tituba!');
    if (!current.charState || current.charState.titubaUsesLeft <= 0) return socket.emit('error_msg', 'ท่านใช้ความสามารถของ Tituba ไปแล้วในเกมนี้!');
    if (!room.deck || room.deck.length === 0) return socket.emit('error_msg', 'ไม่มีการ์ดในสำรับจั่ว!');

    current.charState.titubaUsesLeft = 0;
    current.charState.titubaUsedThisTurn = true;

    // ส่งการ์ดเรียงจาก "ใบบนสุดของสำรับ" (ท้ายอาเรย์ room.deck) ไปยัง "ใบล่างสุดของสำรับ" (ต้นอาเรย์ room.deck)
    const deckTopToBottom = [...room.deck].reverse().map((c, idx) => ({
      topOrderIdx: idx,
      id: c.id,
      name: c.name,
      type: c.type,
      val: c.val,
      desc: c.desc
    }));

    broadcastLog(room.code, `🔮 **${current.name}** (Tituba) กำลังใช้ความสามารถจัดเรียงลำดับการ์ดในสำรับจั่ว (เวลา 60 วินาที)...`);
    broadcastCourtUpdate(room);

    socket.emit('prompt_tituba_reorder', {
      duration: 60,
      cards: deckTopToBottom
    });

    clearTimeout(room.titubaTimer);
    room.titubaTimer = setTimeout(() => {
      io.to(current.socketId).emit('tituba_reorder_timeout');
    }, 60000);
  });

  socket.on('tituba_submit_reorder', ({ roomCode, chosenTopIndices }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return;

    clearTimeout(room.titubaTimer);

    const currentTopToBottom = [...room.deck].reverse();
    const total = currentTopToBottom.length;
    const validChosen = [];
    const seen = new Set();

    (chosenTopIndices || []).forEach(rawIdx => {
      const idx = Number(rawIdx);
      if (Number.isInteger(idx) && idx >= 0 && idx < total && !seen.has(idx)) {
        seen.add(idx);
        validChosen.push(idx);
      }
    });

    const newTopToBottom = [];
    validChosen.forEach(idx => newTopToBottom.push(currentTopToBottom[idx]));
    for (let i = 0; i < total; i++) {
      if (!seen.has(i)) newTopToBottom.push(currentTopToBottom[i]);
    }

    // แปลงกลับเป็น room.deck (ซึ่ง pop() จากท้ายอาเรย์)
    room.deck = newTopToBottom.reverse();
    const current = room.players[pIdx];
    broadcastLog(room.code, `🔮 **${current.name}** (Tituba) จัดเรียงลำดับการ์ดในสำรับจั่วเสร็จสิ้นแล้ว!`);
    broadcastCourtUpdate(room);
  });

  socket.on('action_discard_card', ({ roomCode, cardIdx }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const p = room.players.find(pl => pl.socketId === socket.id);
    if (!p || p.hand.length <= 12) return socket.emit('error_msg', 'คุณไม่ได้มีการ์ดเกิน 12 ใบ');
    if (cardIdx < 0 || cardIdx >= p.hand.length) return;

    const card = p.hand.splice(cardIdx, 1)[0];
    addToDiscard(room, [card]);
    broadcastLog(room.code, `🗑️ **${p.name}** ทิ้งการ์ด 1 ใบ (จัดการการ์ดในมือที่เกิน 12 ใบ)`);
    broadcastCourtUpdate(room);
  });

  socket.on('action_play_card', ({ roomCode, cardIdx, targetSocketId, extraTargetId, playAsWitness }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'COURT') return;
    if (room.activeTryalEffect) return socket.emit('error_msg', 'กรุณารอการใช้ความสามารถการ์ดไต่สวนให้เสร็จสิ้นก่อน!');
    if (room.pendingVictimPick) return socket.emit('error_msg', 'กรุณาเลือกเปิดการ์ดไต่สวนของเป้าหมายให้เสร็จก่อน!');
    
    const pIdx = room.players.findIndex(p => p.socketId === socket.id);
    if (pIdx === -1 || room.activePlayerIdx !== pIdx) return socket.emit('error_msg', 'ยังไม่ถึงเทิร์นของท่าน!');

    const current = room.players[pIdx];
    if (socket.id === targetSocketId) return socket.emit('error_msg', 'ห้ามเล่นการ์ดใส่ตนเองตามกฎข้อที่ 1');

    const card = current.hand[cardIdx];
    const target = room.players.find(p => p.socketId === targetSocketId);
    if (!card || !target || !target.isAlive) return;

    const currentEffChar = getEffectiveCharId(room, current);
    const targetEffChar = getEffectiveCharId(room, target);

    // ตรวจสอบ Will Griggs เล่น Alibi เสมือน Witness (+7)
    const isWillWitnessPlay = (card.id === 'alibi' && playAsWitness && currentEffChar === 'will');

    if ((card.type === 'RED' || isWillWitnessPlay) && target.blueCards.some(b => b && b.id === 'piety')) {
      return socket.emit('error_msg', `🛡️ ${target.name} มีการ์ด Piety (พลังศรัทธา) คุ้มกันอยู่ ไม่สามารถลงการ์ดข้อกล่าวหาใส่ได้!`);
    }

    // ตรวจสอบ Mary Warren (ไม่ได้รับผลจาก Matchmaker และ Black Cat)
    if ((card.id === 'matchmaker' || card.id === 'black_cat') && targetEffChar === 'mary') {
      return socket.emit('error_msg', `🛡️ ${target.name} (Mary Warren) ไม่ได้รับผลจากการ์ดแม่สื่อและแมวดำ!`);
    }

    // ตรวจสอบ Sarah Good (การ์ด Robbery และ Arson ไร้ผลและลงกองทิ้ง)
    if (targetEffChar === 'sarah' && (card.id === 'robbery' || card.id === 'arson')) {
      current.hand.splice(cardIdx, 1);
      addToDiscard(room, [card]);
      room.turnActionTaken = 'PLAYED';
      broadcastLog(room.code, `🛡️ **${target.name}** (Sarah Good) ปัดเป่าผลของ **${card.name}** ทิ้งลงกองทิ้งทันที!`);
      broadcastCourtUpdate(room);
      return;
    }

    if (card.id === 'stocks' && target.blueCards.some(b => b && b.id === 'stocks')) {
      return socket.emit('error_msg', `🔗 ${target.name} ติดขื่อคา (Stocks) อยู่แล้ว ไม่สามารถวางซ้ำได้!`);
    }

    if (card.id === 'curse') {
      if (target.blueCards.length === 0) {
        current.hand.splice(cardIdx, 1);
        addToDiscard(room, [card]);
        room.turnActionTaken = 'PLAYED';
        broadcastLog(room.code, `📜 **${current.name}** ร่าย **Curse** ใส่ **${target.name}** แต่เป้าหมายไม่มีการ์ดสีฟ้าให้ทำลาย`);
        
        io.to(room.code).emit('animate_card_play', { sourceId: socket.id, targetId: target.socketId, card: card });
        checkVictory(room);
        broadcastCourtUpdate(room);
        return;
      } else if (target.blueCards.length === 1) {
        const removedBlue = target.blueCards.pop();
        current.hand.splice(cardIdx, 1);
        addToDiscard(room, [card, removedBlue]);
        room.turnActionTaken = 'PLAYED';
        broadcastLog(room.code, `📜 **${current.name}** ร่าย **Curse** ทำลายการ์ด **${removedBlue.name}** ของ **${target.name}** ทิ้งไป!`);
        
        io.to(room.code).emit('animate_card_play', { sourceId: socket.id, targetId: target.socketId, card: card });
        checkVictory(room);
        broadcastCourtUpdate(room);
        return;
      } else {
        room.pendingCurse = { attackerId: socket.id, targetId: target.socketId, cardIdx: cardIdx };
        socket.emit('prompt_curse_select', { targetName: target.name, blueCards: target.blueCards });
        return;
      }
    }

    current.hand.splice(cardIdx, 1);
    room.turnActionTaken = 'PLAYED';
    if (isWillWitnessPlay) {
      broadcastLog(room.code, `👁️ **${current.name}** (Will Griggs) ใช้ความสามารถร่าย **${card.name}** เสมือนเป็นการ์ด **พยาน (+7 ข้อกล่าวหา)** ใส่ **${target.name}**!`);
    } else {
      broadcastLog(room.code, `📜 **${current.name}** ร่ายการ์ด **${card.name}** ใส่ **${target.name}**`);
    }
    
    io.to(room.code).emit('animate_card_play', { sourceId: socket.id, targetId: target.socketId, card: card });

    if (card.type === 'RED' || isWillWitnessPlay) {
      let addedVal = isWillWitnessPlay ? 7 : card.val;
      if (!isWillWitnessPlay && targetEffChar === 'cotton' && card.id === 'evidence') {
        addedVal = 1;
        broadcastLog(room.code, `✨ **${target.name}** (Cotton Mather) ลดทอนผลของ Evidence เหลือเพียง 1 ข้อกล่าวหา!`);
      }

      target.redPoints += addedVal;
      target.redCardsOnTable.push(card);
      const threshold = getAccusationThreshold(room, current, target);
      broadcastLog(room.code, `🔥 ข้อกล่าวหาของ **${target.name}** สะสมเป็น ${target.redPoints}/${threshold} แต้ม`);

      if (target.redPoints >= threshold) {
        triggerAccusationThresholdReached(room, current, target);
        return;
      }
    } else if (card.type === 'GREEN') {
      if (card.id === 'alibi') {
        const removed = Math.min(3, target.redPoints);
        target.redPoints = Math.max(0, target.redPoints - 3);
        target.redCardsOnTable.splice(0, removed);
        addToDiscard(room, [card]);
      } else if (card.id === 'arson') {
        addToDiscard(room, target.hand);
        target.hand = [];
        addToDiscard(room, [card]);
      } else if (card.id === 'robbery') {
        const dest = room.players.find(p => p.socketId === extraTargetId);
        if (dest && dest.isAlive) {
          dest.hand.push(...target.hand);
          target.hand = [];
        }
        addToDiscard(room, [card]);
      } else if (card.id === 'scapegoat') {
        const dest = room.players.find(p => p.socketId === extraTargetId);
        if (dest && dest.isAlive) {
          const destEffChar = getEffectiveCharId(room, dest);

          target.redCardsOnTable.forEach(rc => {
            dest.redCardsOnTable.push(rc);
            if (rc.id === 'evidence' && destEffChar === 'cotton') {
              dest.redPoints += 1;
            } else if (rc.id === 'alibi') {
              dest.redPoints += 7;
            } else {
              dest.redPoints += (rc.val || 1);
            }
          });

          target.blueCards.forEach(blue => {
            if (!blue) return;
            if ((blue.id === 'matchmaker' || blue.id === 'black_cat') && destEffChar === 'mary') {
              addToDiscard(room, [blue]);
              broadcastLog(room.code, `🛡️ **${dest.name}** (Mary Warren) ไม่ได้รับผลจาก **${blue.name}** การ์ดจึงถูกทิ้งลงกองทิ้ง`);
            } else if (blue.id === 'matchmaker' && dest.blueCards.some(b => b && b.id === 'matchmaker')) {
              addToDiscard(room, [blue]);
            } else if (blue.id === 'stocks' && dest.blueCards.some(b => b && b.id === 'stocks')) {
              addToDiscard(room, [blue]);
            } else {
              dest.blueCards.push(blue);
            }
          });

          target.redPoints = 0;
          target.redCardsOnTable = [];
          target.blueCards = [];

          addToDiscard(room, [card]);

          const destThreshold = getAccusationThreshold(room, current, dest);
          if (dest.redPoints >= destThreshold) {
            triggerAccusationThresholdReached(room, current, dest);
            return;
          }
        } else {
          addToDiscard(room, [card]);
        }
      }
    } else if (card.type === 'BLUE') {
      if (card.id === 'stocks') {
        target.blueCards.push(card);
      } else if (card.id === 'matchmaker' && target.blueCards.some(b => b && b.id === 'matchmaker')) {
        addToDiscard(room, [card]);
        broadcastLog(room.code, `💔 **${target.name}** มีการ์ด Matchmaker อยู่แล้ว การ์ดใบที่ 2 จึงสลายลงกองทิ้งทันที`);
      } else {
        target.blueCards.push(card);
        if (card.id === 'black_cat') {
          room.blackCatOwnerId = target.socketId;
        }
      }
    }

    checkVictory(room);
    broadcastCourtUpdate(room);
  });

  socket.on('action_resolve_curse', ({ roomCode, blueCardIdx }) => {
    const room = rooms[roomCode];
    if (!room || !room.pendingCurse) return;
    if (room.pendingCurse.attackerId !== socket.id) return;

    const attacker = room.players.find(p => p.socketId === socket.id);
    const target = room.players.find(p => p.socketId === room.pendingCurse.targetId);
    if (!attacker || !target) return;

    const curseCard = attacker.hand[room.pendingCurse.cardIdx];
    const removedBlue = target.blueCards.splice(blueCardIdx, 1)[0];
    
    attacker.hand.splice(room.pendingCurse.cardIdx, 1);
    addToDiscard(room, [curseCard, removedBlue]);
    
    room.turnActionTaken = 'PLAYED';
    room.pendingCurse = null;

    broadcastLog(room.code, `📜 **${attacker.name}** ร่าย **Curse** เลือกล้างการ์ด **${removedBlue.name}** ของ **${target.name}** ทิ้งไป!`);
    
    io.to(room.code).emit('animate_card_play', { sourceId: attacker.socketId, targetId: target.socketId, card: curseCard });
    
    checkVictory(room);
    broadcastCourtUpdate(room);
  });

  socket.on('action_cancel_curse', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || !room.pendingCurse) return;
    if (room.pendingCurse.attackerId !== socket.id) return;
    room.pendingCurse = null; 
  });

  socket.on('submit_chosen_victim_tryal', ({ roomCode, targetSocketId, tryalIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const target = room.players.find(p => p.socketId === targetSocketId);
    if (!target || !target.tryals[tryalIndex] || target.tryals[tryalIndex].revealed) return;

    revealTryalCard(room, target, tryalIndex, socket.id, 'ACCUSATION');
    if (checkVictory(room)) return;
    broadcastCourtUpdate(room);
    processNextTryalEffect(room);
  });

  socket.on('submit_charlatan_targets', ({ roomCode, targetSocketIds }) => {
    const room = rooms[roomCode];
    if (!room || !room.activeTryalEffect || room.activeTryalEffect.type !== 'CHARLATAN') return;
    if (room.activeTryalEffect.actorId !== socket.id) return;

    const actor = room.players.find(p => p.socketId === socket.id);
    if (!actor) return;

    clearTimeout(room.tryalEffectTimer);
    resolveCharlatanEffect(room, actor, targetSocketIds);
  });

  socket.on('submit_gravedigger_target', ({ roomCode, targetSocketId, tryalIndex }) => {
    const room = rooms[roomCode];
    if (!room || !room.activeTryalEffect || room.activeTryalEffect.type !== 'GRAVEDIGGER') return;
    if (room.activeTryalEffect.actorId !== socket.id) return;

    const actor = room.players.find(p => p.socketId === socket.id);
    if (!actor) return;

    clearTimeout(room.tryalEffectTimer);
    resolveGravediggerEffect(room, actor, targetSocketId, tryalIndex, room.activeTryalEffect.killAfter);
  });

  socket.on('submit_inquisitor_target', ({ roomCode, targetSocketId, tryalIndex }) => {
    const room = rooms[roomCode];
    if (!room || !room.activeTryalEffect || room.activeTryalEffect.type !== 'INQUISITOR') return;
    if (room.activeTryalEffect.actorId !== socket.id) return;

    const actor = room.players.find(p => p.socketId === socket.id);
    if (!actor) return;

    clearTimeout(room.tryalEffectTimer);
    resolveInquisitorEffect(room, actor, targetSocketId, tryalIndex, room.activeTryalEffect.killAfter);
  });

  socket.on('conspiracy_cat_reveal_submit', ({ roomCode, tryalIndex }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'CONSPIRACY') return;
    const catOwner = room.players.find(p => p.socketId === socket.id);
    if (!catOwner || !catOwner.tryals[tryalIndex] || catOwner.tryals[tryalIndex].revealed) return;

    clearTimeout(room.conspiracyTimer);
    revealTryalCard(room, catOwner, tryalIndex, null, 'CONSPIRACY_CAT');
    broadcastCourtUpdate(room);

    if (checkVictory(room)) return;

    room.afterTryalQueueCallback = 'CONSPIRACY_PICK';
    processNextTryalEffect(room);
  });

  socket.on('submit_conspiracy_pick', ({ roomCode, tryalIndex }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'CONSPIRACY') return;

    const alive = room.players.filter(p => p.isAlive);
    const myAliveIdx = alive.findIndex(p => p.socketId === socket.id);
    if (myAliveIdx === -1) return;

    const leftP = alive[(myAliveIdx - 1 + alive.length) % alive.length];
    if (!leftP || !leftP.tryals[tryalIndex] || leftP.tryals[tryalIndex].revealed) {
      return socket.emit('error_msg', 'การ์ดใบนี้ถูกเปิดแล้ว กรุณาเลือกใบที่ยังคว่ำอยู่!');
    }

    room.conspiracySelections[socket.id] = tryalIndex;
    socket.emit('conspiracy_pick_confirmed', { chosenIndex: tryalIndex, leftPlayerName: leftP.name });

    const allPicked = alive.every(ap => room.conspiracySelections[ap.socketId] !== undefined);
    if (allPicked) {
      clearTimeout(room.conspiracyTimer);
      resolveConspiracyPicks(room);
    }
  });

  socket.on('action_finish_turn', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.activeTryalEffect) return socket.emit('error_msg', 'กรุณารอการใช้ความสามารถการ์ดไต่สวนให้เสร็จสิ้นก่อน!');
    if (room.pendingVictimPick) return socket.emit('error_msg', 'กรุณาเลือกเปิดการ์ดไต่สวนของเป้าหมายให้เสร็จก่อน!');
    const p = room.players.find(pl => pl.socketId === socket.id);
    if (p && p.hand.length > 12) return socket.emit('error_msg', 'การ์ดในมือเกิน 12 ใบ กรุณาทิ้งการ์ดก่อนจบเทิร์น!');
    passNextTurn(room);
  });

  socket.on('witch_execute_kill', ({ roomCode, targetSocketId }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'NIGHT' || room.nightSubPhase !== 'WITCH') return;
    const sender = room.players.find(p => p.socketId === socket.id);
    if (!sender || !sender.isWitch || !sender.isAlive) return; 

    clearTimeout(room.nightActionTimer);

    room.nightTargetId = targetSocketId;
    broadcastLog(room.code, `🗡️ แม่มดได้ลงมติเลือกเหยื่อสังหารในความมืดเรียบร้อยแล้ว!`);
    
    proceedToConstablePhase(room);
  });

  socket.on('constable_place_gavel', ({ roomCode, targetSocketId }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'NIGHT' || room.nightSubPhase !== 'CONSTABLE') return;
    const sender = room.players.find(p => p.socketId === socket.id);
    if (!sender || !sender.isAlive || !sender.tryals.some(t => t && t.type === 'CONSTABLE' && !t.revealed)) return;

    if (targetSocketId === socket.id) return socket.emit('error_msg', 'ไม่สามารถวางค้อนคุ้มกันตัวเองได้!');
    if (targetSocketId === room.previousGavelTargetId) return socket.emit('error_msg', 'ไม่สามารถวางค้อนคุ้มกันคนเดิมซ้ำสองคืนติดกันได้!');

    clearTimeout(room.nightActionTimer);

    room.previousGavelTargetId = targetSocketId; 
    room.gavelTargetId = targetSocketId;
    broadcastLog(room.code, `🔨 สายตรวจ (Constable) ได้เลือกวางค้อน Gavel เรียบร้อยแล้ว`);
    socket.emit('constable_gavel_placed');

    startConfessionPhase(room);
  });

  socket.on('player_submit_confession', ({ roomCode, tryalIndex, usePhipsSkill }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'CONFESSION') return;
    const p = room.players.find(pl => pl.socketId === socket.id);
    if (!p || !p.isAlive || p.isConfessed) return;

    // สกิล William Phips: สารภาพโดยไม่ต้องหงายการ์ดไต่สวน (1 ครั้งในเกม)
    if (usePhipsSkill && getEffectiveCharId(room, p) === 'william' && p.charState && p.charState.phipsUsesLeft > 0) {
      p.charState.phipsUsesLeft = 0;
      p.isConfessed = true;
      broadcastLog(room.code, `🕊️✨ **${p.name}** (William Phips) ใช้ความสามารถพิเศษ สารภาพบาปโดยไม่ต้องหงายการ์ดไต่สวน!`);
      socket.emit('confession_confirmed');
      broadcastCourtUpdate(room);
      return;
    }

    if (tryalIndex !== undefined && p.tryals[tryalIndex] && !p.tryals[tryalIndex].revealed) {
      p.isConfessed = true;
      broadcastLog(room.code, `🕊️ **${p.name}** ยอมรับการสารภาพบาป และเปิดการ์ดไต่สวนของตนเองเพื่อเอาชีวิตรอด!`);
      revealTryalCard(room, p, tryalIndex, null, 'CONFESSION');
      socket.emit('confession_confirmed');
      broadcastCourtUpdate(room);
      processNextTryalEffect(room);
    }
  });

  socket.on('witch_chat_msg', ({ roomCode, text }) => {
    const room = rooms[roomCode];
    if (!room || room.phase !== 'NIGHT') return;
    const sender = room.players.find(p => p.socketId === socket.id);
    if (!sender || !sender.isWitch || !sender.isAlive) return;
    room.players.filter(p => p.isWitch && p.isAlive).forEach(w => {
      io.to(w.socketId).emit('witch_chat_received', { senderName: sender.name, rank: sender.witchRank, text });
    });
  });

});

// จัดการเมื่อผู้เล่นใส่ความเป้าหมายจนครบเกณฑ์เปิดไพ่ไต่สวน (Abigail Williams & Ann Putnam)
function triggerAccusationThresholdReached(room, attacker, target) {
  target.redPoints = 0;
  addToDiscard(room, target.redCardsOnTable);
  target.redCardsOnTable = [];

  const attackerEffChar = getEffectiveCharId(room, attacker);

  // สกิล Abigail Williams: ลบล้างข้อกล่าวหาทั้งหมดที่อยู่หน้าตัวเองลงกองทิ้ง
  if (attackerEffChar === 'abigail' && (attacker.redPoints > 0 || attacker.redCardsOnTable.length > 0)) {
    addToDiscard(room, attacker.redCardsOnTable);
    attacker.redCardsOnTable = [];
    attacker.redPoints = 0;
    broadcastLog(room.code, `✨ **${attacker.name}** (Abigail Williams) ใส่ความสำเร็จ จึงลบล้างข้อกล่าวหาทั้งหมดที่อยู่หน้าตนเองลงกองทิ้ง!`);
  }

  broadcastLog(room.code, `⚖️ ข้อกล่าวหาครบเกณฑ์! การ์ดแดงทั้งหมดถูกทิ้ง และ **${attacker.name}** ได้สิทธิ์เปิดการ์ดไต่สวนของ **${target.name}**`);

  // สกิล Ann Putnam: ก่อนเลือกหงายการ์ด สามารถจั่วการ์ดได้ 2 ใบ และยังอยู่ในตาเล่นต่อ
  if (attackerEffChar === 'ann') {
    broadcastLog(room.code, `✨ **${attacker.name}** (Ann Putnam) ใช้ความสามารถจั่วการ์ด 2 ใบก่อนเลือกเปิดการ์ดไต่สวน และยังอยู่ในเทิร์นเล่นต่อ!`);
    room.pendingVictimPick = { attackerId: attacker.socketId, targetId: target.socketId };
    enqueueDraws(room, attacker.socketId, 2, 'ANN_SKILL');
    processDrawQueue(room);
    return;
  }

  broadcastCourtUpdate(room);
  io.to(attacker.socketId).emit('prompt_pick_victim_tryal', {
    targetSocketId: target.socketId,
    targetName: target.name,
    tryals: target.tryals.map((t, idx) => ({ index: idx, revealed: t.revealed }))
  });
}

function triggerConspiracyEvent(room) {
  room.phase = 'CONSPIRACY';
  broadcastCourtUpdate(room); 

  const catOwner = room.players.find(p => p.blueCards.some(b => b && b.id === 'black_cat') && p.isAlive);
  if (catOwner) {
    io.to(catOwner.socketId).emit('prompt_conspiracy_cat_reveal', {
      tryals: catOwner.tryals.map((t, idx) => ({ index: idx, revealed: t.revealed }))
    });

    clearTimeout(room.conspiracyTimer);
    room.conspiracyTimer = setTimeout(() => {
      if (room.phase === 'CONSPIRACY' && catOwner.isAlive) {
        const unrevIdx = catOwner.tryals.findIndex(t => t && !t.revealed);
        if (unrevIdx !== -1) {
          broadcastLog(room.code, `⏳ **${catOwner.name}** หมดเวลาเลือก ระบบจึงสุ่มเปิดการ์ดแมวดำให้อัตโนมัติ`);
          revealTryalCard(room, catOwner, unrevIdx, null, 'CONSPIRACY_CAT');
          broadcastCourtUpdate(room);
          if (checkVictory(room)) return;
        }
        room.afterTryalQueueCallback = 'CONSPIRACY_PICK';
        processNextTryalEffect(room);
      }
    }, 15000);
  } else {
    startConspiracyPickPhase(room);
  }
}

function startConspiracyPickPhase(room) {
  if (checkVictory(room)) return;

  const alive = room.players.filter(p => p.isAlive);
  if (alive.length <= 1) {
    room.phase = 'COURT';
    broadcastCourtUpdate(room);
    processDrawQueue(room);
    return;
  }

  room.conspiracySelections = {};
  const duration = 15;

  broadcastLog(room.code, `🌀 **เจตนาร้าย (Conspiracy):** ผู้เล่นทุกคนกำลังเลือกหยิบการ์ดไต่สวนที่คว่ำอยู่ 1 ใบจากผู้เล่นทางซ้ายมือ...`);
  broadcastCourtUpdate(room);

  alive.forEach((p, idx) => {
    const leftP = alive[(idx - 1 + alive.length) % alive.length];
    const hasUnrevealed = leftP.tryals.some(t => t && !t.revealed);

    if (!hasUnrevealed) {
      room.conspiracySelections[p.socketId] = -1;
    } else {
      io.to(p.socketId).emit('prompt_conspiracy_pick_left', {
        duration,
        leftPlayerName: leftP.name,
        tryals: leftP.tryals.map((t, i) => ({
          index: i,
          revealed: t.revealed,
          type: t.revealed ? t.type : 'UNKNOWN'
        }))
      });
    }
  });

  clearTimeout(room.conspiracyTimer);
  room.conspiracyTimer = setTimeout(() => {
    if (room.phase === 'CONSPIRACY') {
      broadcastLog(room.code, `⏳ หมดเวลาเลือกหยิบการ์ด ระบบสุ่มหยิบการ์ดให้ผู้ที่ยังไม่ได้เลือกอัตโนมัติ`);
      resolveConspiracyPicks(room);
    }
  }, duration * 1000);
}

function resolveConspiracyPicks(room) {
  clearTimeout(room.conspiracyTimer);

  const alive = room.players.filter(p => p.isAlive);
  const shiftedInfo = [];

  alive.forEach((p, idx) => {
    const leftP = alive[(idx - 1 + alive.length) % alive.length];
    let chosenIdx = room.conspiracySelections ? room.conspiracySelections[p.socketId] : undefined;

    if (chosenIdx === undefined || chosenIdx < 0 || !leftP.tryals[chosenIdx] || leftP.tryals[chosenIdx].revealed) {
      const unrevIndices = leftP.tryals
        .map((t, i) => (!t.revealed ? i : -1))
        .filter(i => i !== -1);
      if (unrevIndices.length > 0) {
        chosenIdx = unrevIndices[Math.floor(Math.random() * unrevIndices.length)];
      } else {
        chosenIdx = -1;
      }
    }

    if (chosenIdx !== -1 && leftP.tryals[chosenIdx]) {
      shiftedInfo.push({
        to: p,
        from: leftP,
        chosenIdx: chosenIdx,
        card: leftP.tryals[chosenIdx]
      });
    }
  });

  shiftedInfo.forEach(s => {
    const idxInFrom = s.from.tryals.indexOf(s.card);
    if (idxInFrom !== -1) {
      s.from.tryals.splice(idxInFrom, 1);
    }
  });

  shiftedInfo.forEach(s => {
    s.to.tryals.push(s.card);
    if (s.card.type === 'WITCH') {
      s.to.isWitch = true;
      if (!s.to.witchRank) s.to.witchRank = 2;
    }
    io.to(s.to.socketId).emit('conspiracy_inspect_received_card', {
      fromPlayerName: s.from.name,
      cardType: s.card.type
    });
  });

  room.conspiracySelections = {};

  setTimeout(() => {
    room.phase = 'COURT';
    broadcastLog(room.code, `✓ เหตุการณ์ Conspiracy เสร็จสิ้น กลับเข้าสู่การพิจารณาคดี`);
    broadcastCourtUpdate(room);
    // จั่วการ์ดที่ค้างอยู่ในคิวต่อให้ครบ (เช่น แอนน์ พุตแนม, รีเบคก้า เนิร์ส หรือคนที่จั่วใบแรกเจอ Conspiracy)
    processDrawQueue(room);
  }, 4000);
}

function handleNight(room) {
  room.phase = 'NIGHT';
  room.nightSubPhase = 'WITCH';
  room.nightTargetId = null;
  room.gavelTargetId = null;
  room.players.forEach(p => p.isConfessed = false);

  broadcastCourtUpdate(room);
  broadcastNightState(room);

  clearTimeout(room.nightActionTimer);
  room.nightActionTimer = setTimeout(() => {
    if (room.phase === 'NIGHT' && room.nightSubPhase === 'WITCH') {
      broadcastLog(room.code, `⏳ แม่มดปรึกษากันนานเกินไป! (ข้ามการลอบสังหาร)`);
      proceedToConstablePhase(room);
    }
  }, 20000); 
}

function proceedToConstablePhase(room) {
  room.nightSubPhase = 'CONSTABLE';
  
  const hasAliveConstable = room.players.some(p => p.isAlive && p.tryals.some(t => t && t.type === 'CONSTABLE' && !t.revealed));

  if (hasAliveConstable) {
    broadcastLog(room.code, `🔨 สายตรวจกำลังลืมตาเพื่อปกป้องชาวเมือง...`);
    broadcastNightState(room);

    clearTimeout(room.nightActionTimer);
    room.nightActionTimer = setTimeout(() => {
      if (room.phase === 'NIGHT' && room.nightSubPhase === 'CONSTABLE') {
        broadcastLog(room.code, `⏳ สายตรวจหลับลึกหรือหายตัวไป... (หมดเวลาวางค้อน)`);
        startConfessionPhase(room);
      }
    }, 15000); 
  } else {
    startConfessionPhase(room); 
  }
}

function broadcastNightState(room) {
  const alivePlayers = room.players.filter(p => p.isAlive).map(p => ({ 
    socketId: p.socketId, 
    name: p.name,
    hasAsylum: p.blueCards.some(b => b && b.id === 'asylum') 
  }));

  room.players.forEach(p => {
    const isConstable = p.tryals.some(t => t && t.type === 'CONSTABLE' && !t.revealed);
    io.to(p.socketId).emit('night_sync', {
      subPhase: room.nightSubPhase,
      isWitch: p.isWitch,
      isConstable: isConstable,
      isAlive: p.isAlive,
      witchRank: p.witchRank,
      alivePlayers,
      previousGavelId: room.previousGavelTargetId 
    });
  });
}

function startConfessionPhase(room) {
  room.phase = 'CONFESSION';
  let countdown = 10;

  broadcastCourtUpdate(room); 
  broadcastLog(room.code, `🕯️ **ช่วงเวลาสารภาพบาป (The Confession)!** ผู้เล่นทุกคนมีเวลา 10 วินาทีเพื่อสารภาพบาป`);
  io.to(room.code).emit('confession_phase_started', { duration: countdown });

  if (room.confessionCountdownTimer) clearInterval(room.confessionCountdownTimer);
  room.confessionCountdownTimer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(room.confessionCountdownTimer);
      if (room.activeTryalEffect || (room.tryalEffectQueue && room.tryalEffectQueue.length > 0)) {
        room.afterTryalQueueCallback = 'RESOLVE_NIGHT';
        processNextTryalEffect(room);
      } else {
        resolveNightActions(room);
      }
    }
  }, 1000);
}

function resolveNightActions(room) {
  if (room.nightTargetId) {
    const victim = room.players.find(p => p.socketId === room.nightTargetId);
    if (victim) {
      const isAsylum = victim.blueCards.some(b => b && b.id === 'asylum');
      const isGavel = (room.gavelTargetId === victim.socketId);
      const isConfessed = victim.isConfessed;

      if (isConfessed) {
        broadcastLog(room.code, `🕊️ **${victim.name}** รอดชีวิตจากการถูกลอบสังหาร เพราะได้สารภาพบาปไปแล้ว!`);
      } else if (isGavel) {
        broadcastLog(room.code, `🔨 **${victim.name}** รอดชีวิตเพราะมีค้อน Gavel ของมือปราบคุ้มกันอยู่!`);
      } else if (isAsylum) {
        broadcastLog(room.code, `🏥 **${victim.name}** รอดชีวิตเพราะซ่อนตัวอยู่ใน Asylum!`);
      } else {
        killPlayer(room, victim, "ถูกลอบสังหารในคืนรัตติกาล");
      }
    }
  }

  broadcastLog(room.code, `🔄 เช้าวันใหม่มาถึง! นำการ์ดกองทิ้งมาสับใหม่ โดยสอดการ์ด Night ไว้ใต้สุด`);
  
  const catIndex = room.discardPile.findIndex(c => c && c.id === 'black_cat');
  if (catIndex !== -1) {
      const catCard = room.discardPile.splice(catIndex, 1)[0];
      room.deck.push(catCard);
      room.deck.sort(() => Math.random() - 0.5);
      broadcastLog(room.code, `🐈‍⬛ **Black Cat** (แมวดำ) ได้กระโดดออกจากกองทิ้ง สับสุ่มกลับเข้าไปซ่อนตัวในกองจั่วอีกครั้ง!`);
  }

  let recycledCards = room.discardPile.filter(c => c && c.id !== 'night' && c.id !== 'conspiracy');
  recycledCards.sort(() => Math.random() - 0.5);
  
  let newDeck = [...recycledCards, ...room.deck];
  newDeck.unshift({ id: 'night', name: "Night (รัตติกาล)", type: "BLACK", desc: "ค่ำคืนล่าสังหารและวางค้อนคุ้มกัน" });
  
  const hasConspiracy = newDeck.some(c => c && c.id === 'conspiracy');
  if (!hasConspiracy) {
      const mid = Math.floor(newDeck.length / 2);
      newDeck.splice(mid, 0, { id: 'conspiracy', name: "Conspiracy (เจตนาร้าย)", type: "BLACK", desc: "เปิดการ์ดแมวดำ และสลับการ์ดเวียนซ้าย" });
  }

  room.deck = newDeck;
  room.discardPile = [];
  room.phase = 'COURT';

  io.to(room.code).emit('night_ended');
  if (checkVictory(room)) return;
  broadcastCourtUpdate(room);

  // หากมีคิวจั่วการ์ดหรือเปิดไพ่ค้างอยู่จากก่อนเข้า Night ให้ประมวลผลต่อ
  if ((room.drawQueue && room.drawQueue.length > 0) || room.pendingVictimPick) {
    processDrawQueue(room);
  } else {
    room.postDrawTurnEnd = false;
    passNextTurn(room);
  }
}

// เปิดการ์ดไต่สวน พร้อมตรวจสอบสกิล Rebecca Nurse และการเปิดการ์ดพิเศษ 4 ใบ
function revealTryalCard(room, target, tryalIdx, revealerSocketId, source = 'ACCUSATION') {
  const card = target.tryals[tryalIdx];
  if (!card || card.revealed) return;
  card.revealed = true;
  broadcastLog(room.code, `📜 การ์ดไต่สวนของ **${target.name}** ถูกเปิดเผย: **${card.type}**!`);

  // สกิล Rebecca Nurse: ทุกครั้งที่มีการหงายการ์ดไต่สวนของผู้เล่นอื่น (ไม่นับการตายหรือสารภาพบาป) ได้จั่วการ์ด 1 ใบ
  if (source !== 'CONFESSION') {
    room.players.forEach(p => {
      if (p.isAlive && p.socketId !== target.socketId && getEffectiveCharId(room, p) === 'rebecca') {
        enqueueDraws(room, p.socketId, 1, 'REBECCA_SKILL');
      }
    });
  }

  if (card.type === 'WITCH') {
    killPlayer(room, target, "ถูกเปิดโปงว่าเป็นแม่มด");
    return;
  }

  const isLastCard = target.tryals.every(t => t && t.revealed);

  if (card.type === 'PICKPOCKET') {
    if (revealerSocketId && revealerSocketId !== target.socketId) {
      const revealer = room.players.find(p => p.socketId === revealerSocketId);
      if (revealer && revealer.hand && revealer.hand.length > 0) {
        const stolenCount = revealer.hand.length;
        target.hand.push(...revealer.hand);
        revealer.hand = [];
        broadcastLog(room.code, `🧤 **Pickpocket!** **${target.name}** ฉกการ์ดบนมือทั้งหมด (${stolenCount} ใบ) ของ **${revealer.name}** มาไว้ในมือทันที! (Sarah Good ป้องกันไม่ได้)`);
      } else if (revealer) {
        broadcastLog(room.code, `🧤 **Pickpocket!** **${target.name}** พยายามล้วงกระเป๋า **${revealer.name}** แต่ไม่มีการ์ดในมือให้ขโมย!`);
      }
    } else {
      broadcastLog(room.code, `🧤 **${target.name}** เปิดพบ **Pickpocket** ด้วยตนเอง จึงไม่มีผู้ใดถูกล้วงกระเป๋า`);
    }

    if (isLastCard) {
      killPlayer(room, target, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น");
    }
    return;
  }

  if (card.type === 'CHARLATAN') {
    if (isLastCard) {
      broadcastLog(room.code, `🎭 **Charlatan** ของ **${target.name}** ถูกเปิดเป็นใบสุดท้าย จึงไม่ได้ใช้ความสามารถ`);
      killPlayer(room, target, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น");
    } else {
      room.tryalEffectQueue.push({
        type: 'CHARLATAN',
        actorId: target.socketId,
        killAfter: false
      });
    }
    return;
  }

  if (card.type === 'GRAVEDIGGER') {
    room.tryalEffectQueue.push({
      type: 'GRAVEDIGGER',
      actorId: target.socketId,
      killAfter: isLastCard
    });
    return;
  }

  if (card.type === 'INQUISITOR') {
    room.tryalEffectQueue.push({
      type: 'INQUISITOR',
      actorId: target.socketId,
      killAfter: isLastCard
    });
    return;
  }

  if (isLastCard) {
    killPlayer(room, target, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น");
  }
}

function processNextTryalEffect(room) {
  if (checkVictory(room)) return;
  if (room.activeTryalEffect) return;

  if (!room.tryalEffectQueue || room.tryalEffectQueue.length === 0) {
    if (room.afterTryalQueueCallback === 'CONSPIRACY_PICK') {
      room.afterTryalQueueCallback = null;
      startConspiracyPickPhase(room);
      return;
    }
    if (room.afterTryalQueueCallback === 'RESOLVE_NIGHT') {
      room.afterTryalQueueCallback = null;
      resolveNightActions(room);
      return;
    }
    // ประมวลผลคิวจั่วการ์ดที่อาจเกิดจากสกิล Rebecca Nurse
    if (room.drawQueue && room.drawQueue.length > 0 && room.phase === 'COURT') {
      processDrawQueue(room);
      return;
    }
    broadcastCourtUpdate(room);
    return;
  }

  const effect = room.tryalEffectQueue.shift();
  const actor = room.players.find(p => p.socketId === effect.actorId);
  if (!actor) return processNextTryalEffect(room);

  if (effect.type === 'CHARLATAN') {
    const eligible = room.players.filter(p => p.isAlive && p.tryals.some(t => t && !t.revealed));
    if (eligible.length < 2) {
      broadcastLog(room.code, `🎭 มีผู้เล่นที่เหลือการ์ดคว่ำไม่เพียงพอสำหรับความสามารถ **Charlatan**`);
      return processNextTryalEffect(room);
    }

    const requiredCount = Math.min(3, eligible.length);
    room.activeTryalEffect = { ...effect, requiredCount };

    broadcastLog(room.code, `🎭 รอ **${actor.name}** ใช้ความสามารถ **Charlatan** เลือกผู้เล่น ${requiredCount} คนเพื่อนำการ์ดไต่สวนมาสับและแจกคืน...`);
    io.to(actor.socketId).emit('prompt_charlatan_select', {
      requiredCount,
      players: eligible.map(p => ({ socketId: p.socketId, name: p.name }))
    });

    clearTimeout(room.tryalEffectTimer);
    room.tryalEffectTimer = setTimeout(() => {
      if (room.activeTryalEffect && room.activeTryalEffect.type === 'CHARLATAN') {
        const autoIds = eligible.slice(0, requiredCount).map(p => p.socketId);
        broadcastLog(room.code, `⏳ **${actor.name}** หมดเวลาเลือก ระบบจึงสุ่มเลือกเป้าหมาย Charlatan ให้อัตโนมัติ`);
        resolveCharlatanEffect(room, actor, autoIds);
      }
    }, 20000);
    return;
  }

  if (effect.type === 'GRAVEDIGGER') {
    const eligible = room.players.filter(p => {
      if (p.socketId === actor.socketId) return false;
      const hasRevNonWitch = p.tryals.some(t => t && t.revealed && t.type !== 'WITCH');
      if (!hasRevNonWitch) return false;
      if (p.isAlive) return true;
      return !p.isWitch;
    });

    if (eligible.length === 0) {
      broadcastLog(room.code, `⛏️ ไม่มีผู้เล่นอื่นที่สามารถใช้ความสามารถ **Gravedigger** คว่ำการ์ดให้ได้`);
      if (effect.killAfter) {
        killPlayer(room, actor, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น");
      }
      broadcastCourtUpdate(room);
      return processNextTryalEffect(room);
    }

    room.activeTryalEffect = effect;
    broadcastLog(room.code, `⛏️ รอ **${actor.name}** ใช้ความสามารถ **Gravedigger** เลือกคว่ำการ์ดไต่สวนที่หงายแล้วของผู้เล่นอื่น 1 ใบ...`);
    io.to(actor.socketId).emit('prompt_gravedigger_select', {
      players: eligible.map(p => ({
        socketId: p.socketId,
        name: p.name,
        isAlive: p.isAlive,
        tryals: p.tryals.map((t, idx) => ({
          index: idx,
          revealed: t.revealed,
          type: t.revealed ? t.type : 'UNKNOWN'
        }))
      }))
    });

    clearTimeout(room.tryalEffectTimer);
    room.tryalEffectTimer = setTimeout(() => {
      if (room.activeTryalEffect && room.activeTryalEffect.type === 'GRAVEDIGGER') {
        const randP = eligible[0];
        const revIdx = randP.tryals.findIndex(t => t && t.revealed && t.type !== 'WITCH');
        broadcastLog(room.code, `⏳ **${actor.name}** หมดเวลาเลือก ระบบสุ่มใช้ความสามารถ Gravedigger ให้อัตโนมัติ`);
        resolveGravediggerEffect(room, actor, randP.socketId, revIdx, effect.killAfter);
      }
    }, 20000);
    return;
  }

  if (effect.type === 'INQUISITOR') {
    const eligible = room.players.filter(p => p.isAlive && p.socketId !== actor.socketId && p.tryals.some(t => t && !t.revealed));
    if (eligible.length === 0) {
      broadcastLog(room.code, `🔍 ไม่มีผู้เล่นอื่นที่เหลือการ์ดคว่ำให้ **Inquisitor** เปิดเผยได้`);
      if (effect.killAfter) {
        killPlayer(room, actor, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น");
      }
      broadcastCourtUpdate(room);
      return processNextTryalEffect(room);
    }

    room.activeTryalEffect = effect;
    broadcastLog(room.code, `🔍 รอ **${actor.name}** ใช้ความสามารถ **Inquisitor** เลือกเปิดการ์ดไต่สวนของใครก็ได้ 1 ใบทันที!`);
    io.to(actor.socketId).emit('prompt_inquisitor_select', {
      players: eligible.map(p => ({
        socketId: p.socketId,
        name: p.name,
        tryals: p.tryals.map((t, idx) => ({
          index: idx,
          revealed: t.revealed,
          type: t.revealed ? t.type : 'UNKNOWN'
        }))
      }))
    });

    clearTimeout(room.tryalEffectTimer);
    room.tryalEffectTimer = setTimeout(() => {
      if (room.activeTryalEffect && room.activeTryalEffect.type === 'INQUISITOR') {
        const randP = eligible[0];
        const unrevIdx = randP.tryals.findIndex(t => t && !t.revealed);
        broadcastLog(room.code, `⏳ **${actor.name}** หมดเวลาเลือก ระบบสุ่มใช้ความสามารถ Inquisitor ให้อัตโนมัติ`);
        resolveInquisitorEffect(room, actor, randP.socketId, unrevIdx, effect.killAfter);
      }
    }, 20000);
    return;
  }
}

function resolveCharlatanEffect(room, actor, targetSocketIds) {
  const reqCount = room.activeTryalEffect ? room.activeTryalEffect.requiredCount : 3;
  const uniqueIds = Array.from(new Set(targetSocketIds || []));
  const chosenPlayers = uniqueIds
    .map(id => room.players.find(p => p.socketId === id && p.isAlive && p.tryals.some(t => t && !t.revealed)))
    .filter(Boolean)
    .slice(0, reqCount);

  if (chosenPlayers.length < reqCount) {
    return;
  }

  const extractedCards = [];
  chosenPlayers.forEach(p => {
    const unrevIndices = p.tryals.map((t, i) => (!t.revealed ? i : -1)).filter(i => i !== -1);
    const randIdx = unrevIndices[Math.floor(Math.random() * unrevIndices.length)];
    const removedCard = p.tryals.splice(randIdx, 1)[0];
    extractedCards.push(removedCard);
  });

  extractedCards.sort(() => Math.random() - 0.5);

  chosenPlayers.forEach(p => {
    const newCard = extractedCards.pop();
    p.tryals.push(newCard);
    if (newCard.type === 'WITCH') {
      p.isWitch = true;
      if (!p.witchRank) p.witchRank = 2;
    }
    io.to(p.socketId).emit('conspiracy_inspect_received_card', {
      fromPlayerName: `การสับไพ่ Charlatan (${actor.name})`,
      cardType: newCard.type
    });
  });

  broadcastLog(room.code, `🎭 **${actor.name}** (Charlatan) นำการ์ดไต่สวนที่คว่ำอยู่ของ **${chosenPlayers.map(p => p.name).join(', ')}** คนละ 1 ใบมาสับรวมกันแล้วแจกคืนเรียบร้อย!`);
  room.activeTryalEffect = null;
  broadcastCourtUpdate(room);
  processNextTryalEffect(room);
}

function resolveGravediggerEffect(room, actor, targetSocketId, tryalIndex, killAfter) {
  const target = room.players.find(p => p.socketId === targetSocketId);
  if (!target || target.socketId === actor.socketId) return;
  if (!target.tryals[tryalIndex] || !target.tryals[tryalIndex].revealed || target.tryals[tryalIndex].type === 'WITCH') return;
  if (!target.isAlive && target.isWitch) return;

  const wasDead = !target.isAlive;
  target.tryals[tryalIndex].revealed = false;

  if (wasDead) {
    target.isAlive = true;
    target.redPoints = 0;
    target.redCardsOnTable = [];
    broadcastLog(room.code, `⛏️✨ **ปาฏิหาริย์สัปเหร่อ!** **${actor.name}** (Gravedigger) เลือกคว่ำการ์ดไต่สวนให้ **${target.name}** และชุบชีวิตกลับเข้าสู่ศาลอีกครั้ง!`);
  } else {
    broadcastLog(room.code, `⛏️ **${actor.name}** (Gravedigger) เลือกคว่ำการ์ดไต่สวนที่หงายแล้วของ **${target.name}** กลับลงไป 1 ใบ และนำการ์ดที่คว่ำอยู่ทั้งหมดมาสับวางใหม่!`);
  }

  const unrevCards = target.tryals.filter(t => !t.revealed);
  unrevCards.sort(() => Math.random() - 0.5);
  let uIdx = 0;
  target.tryals = target.tryals.map(t => (t.revealed ? t : unrevCards[uIdx++]));

  room.activeTryalEffect = null;

  if (killAfter && actor.isAlive && actor.tryals.every(t => t && t.revealed)) {
    killPlayer(room, actor, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น (หลังใช้ความสามารถ Gravedigger)");
  }

  broadcastCourtUpdate(room);
  processNextTryalEffect(room);
}

function resolveInquisitorEffect(room, actor, targetSocketId, tryalIndex, killAfter) {
  const target = room.players.find(p => p.socketId === targetSocketId);
  if (!target || !target.isAlive || target.socketId === actor.socketId) return;
  if (!target.tryals[tryalIndex] || target.tryals[tryalIndex].revealed) return;

  room.activeTryalEffect = null;
  broadcastLog(room.code, `🔍 **${actor.name}** (Inquisitor) ใช้อำนาจผู้สอบสวนสั่งเปิดการ์ดไต่สวนใบที่ ${tryalIndex + 1} ของ **${target.name}** ทันที!`);

  revealTryalCard(room, target, tryalIndex, actor.socketId, 'INQUISITOR');

  if (killAfter && actor.isAlive && actor.tryals.every(t => t && t.revealed)) {
    killPlayer(room, actor, "การ์ดไต่สวนถูกเปิดจนหมดสิ้น (หลังใช้ความสามารถ Inquisitor)");
  }

  broadcastCourtUpdate(room);
  processNextTryalEffect(room);
}

// จัดการเมื่อผู้เล่นเสียชีวิต พร้อมตรวจสอบสกิล John Proctor และ Matchmaker
function killPlayer(room, victim, reason) {
  if (!victim.isAlive) return; 
  victim.isAlive = false;
  victim.tryals.forEach(t => { if(t) t.revealed = true; });
  
  const hadMatchmaker = victim.blueCards.some(b => b && b.id === 'matchmaker');
  addToDiscard(room, victim.redCardsOnTable || []);
  victim.redCardsOnTable = [];
  victim.redPoints = 0;

  // สกิล John Proctor: เมื่อมีผู้เล่นตาย จะได้รับการ์ดสีน้ำเงินที่อยู่ด้านหน้าและการ์ดบนมือทั้งหมดของผู้เล่นคนนั้นขึ้นมือ
  const johnPlayer = room.players.find(p => p.isAlive && p.socketId !== victim.socketId && getEffectiveCharId(room, p) === 'john');
  if (johnPlayer) {
    const matchmakersToDiscard = victim.blueCards.filter(b => b && b.id === 'matchmaker');
    const transferableBlues = victim.blueCards
      .filter(b => b && b.id !== 'matchmaker')
      .map(b => ({ ...b, type: 'BLUE', val: 0 }));
    const lootCards = [...(victim.hand || []), ...transferableBlues];

    addToDiscard(room, matchmakersToDiscard);
    if (lootCards.length > 0) {
      johnPlayer.hand.push(...lootCards);
      broadcastLog(room.code, `✨ **${johnPlayer.name}** (John Proctor) ได้รับการ์ดสีน้ำเงินและการ์ดบนมือทั้งหมด (${lootCards.length} ใบ) ของ **${victim.name}** ขึ้นมือ!`);
    }
  } else {
    addToDiscard(room, [...victim.hand, ...victim.blueCards]);
  }

  victim.hand = [];
  victim.blueCards = [];
  broadcastLog(room.code, `⚰️ **${victim.name}** เสียชีวิตแล้ว! (${reason})`);

  if (hadMatchmaker) {
    const lovers = room.players.filter(p => p.isAlive && p.blueCards.some(b => b && b.id === 'matchmaker'));
    lovers.forEach(lover => {
      broadcastLog(room.code, `💔 **${lover.name}** ขาดใจตายตามคู่รัก! (ผลจากการ์ด Matchmaker)`);
      killPlayer(room, lover, "ตายตามคนรัก (Matchmaker)");
    });
  }
}

function getActiveLeadWitch(room) {
  const aliveWitches = room.players.filter(p => p.isWitch && p.isAlive).sort((a, b) => a.witchRank - b.witchRank);
  return aliveWitches[0] || null;
}

function passNextTurn(room) {
  if (checkVictory(room)) return;
  room.turnActionTaken = null;

  do {
    room.activePlayerIdx = (room.activePlayerIdx + 1) % room.players.length;
  } while (!room.players[room.activePlayerIdx].isAlive);

  const current = room.players[room.activePlayerIdx];
  if (current.charState) current.charState.titubaUsedThisTurn = false;

  const stocksIdx = current.blueCards.findIndex(b => b && b.id === 'stocks');
  if (stocksIdx !== -1) {
    const discardedStocks = current.blueCards.splice(stocksIdx, 1)[0];
    addToDiscard(room, [discardedStocks]);
    broadcastLog(room.code, `⛓️ **${current.name}** ติดขื่อคา (Stocks) ถูกข้ามเทิร์นนี้!`);
    broadcastCourtUpdate(room);
    setTimeout(() => passNextTurn(room), 1500);
    return;
  }

  broadcastCourtUpdate(room);
}

function checkVictory(room) {
  const alive = room.players.filter(p => p.isAlive);
  
  const buildGameOverPayload = (winner, reason) => {
    return {
      winner,
      reason,
      players: room.players.map(p => ({
        name: p.name,
        char: p.char ? p.char.th : 'ชาวเมือง',
        isAlive: p.isAlive,
        isWitch: p.isWitch,
        finalTryals: p.tryals.map(t => t ? t.type : 'UNKNOWN')
      })),
      log: room.gameLog || []
    };
  };

  if (alive.length > 0 && alive.every(p => p.isWitch)) {
    io.to(room.code).emit('game_over', buildGameOverPayload("เหล่าแม่มด (WITCHES)", "ผู้รอดชีวิตทั้งหมดกลายเป็นแม่มด!"));
    return true;
  }

  let witchesLeft = 0;
  room.players.forEach(p => p.tryals.forEach(t => { if (t && t.type === 'WITCH' && !t.revealed) witchesLeft++; }));
  if (witchesLeft === 0) {
    io.to(room.code).emit('game_over', buildGameOverPayload("ชาวเมือง (TOWNSPEOPLE)", "การ์ดแม่มดทั้งหมดถูกเปิดเผยและกำจัดสิ้นแล้ว!"));
    return true;
  }
  return false;
}

function runDawnSequence(room) {
  room.phase = 'DAWN';
  io.to(room.code).emit('dawn_step_1_sleep', { duration: 5, voiceText: "ทุกคนในหมู่บ้านหลับตา" });

  setTimeout(() => {
    const witches = room.players.filter(p => p.isWitch).map(w => ({ name: w.name, rank: w.witchRank }));
    room.players.forEach(p => {
      io.to(p.socketId).emit('dawn_step_2_witches_wake', { duration: 7, voiceText: "ทุกคนหลับตา แม่มดลืมตาเจอหน้ากัน", isWitch: p.isWitch, witchFriends: witches });
    });

    setTimeout(() => {
      const leadWitch = getActiveLeadWitch(room);
      room.players.forEach(p => {
        io.to(p.socketId).emit('dawn_step_3_black_cat', {
          duration: 7,
          voiceText: "แม่มด ทำการวางการ์ดแมวดำ",
          isWitch: p.isWitch,
          isDecider: (leadWitch && leadWitch.socketId === p.socketId),
          deciderName: leadWitch ? leadWitch.name : '',
          players: room.players.map(pl => ({
            socketId: pl.socketId,
            name: pl.name,
            isMaryImmune: getEffectiveCharId(room, pl) === 'mary'
          }))
        });
      });
    }, 7000);
  }, 5000);
}

function broadcastCourtUpdate(room) {
  const discardNonBlackCount = (room.discardPile || []).filter(c => c && c.type !== 'BLACK').length;

  room.players.forEach(receiver => {
    const statePayload = {
      activePlayerIdx: room.activePlayerIdx,
      blackCatOwnerId: room.blackCatOwnerId,
      turnActionTaken: room.turnActionTaken,
      phase: room.phase,
      options: room.options,
      deckCount: room.deck ? room.deck.length : 0,
      discardCount: room.discardPile ? room.discardPile.length : 0,
      discardNonBlackCount,
      players: room.players.map(p => {
        const effInfo = getEffectiveCharInfo(room, p);
        const maxRedThreshold = (effInfo.id === 'george') ? 8 : 7;
        return {
          socketId: p.socketId,
          name: p.name || 'Unknown',
          char: p.char || null,
          effectiveChar: effInfo.charObj || null,
          copiedFromName: effInfo.copiedFromName || null,
          charState: p.charState || createInitialCharState(),
          maxRedThreshold,
          isAlive: p.isAlive,
          isWitch: p.socketId === receiver.socketId ? p.isWitch : undefined, 
          redPoints: p.redPoints || 0,
          blueCards: p.blueCards || [],
          hand: p.socketId === receiver.socketId ? (p.hand || []) : new Array((p.hand || []).length).fill({ name: '?' }),
          tryals: (p.tryals || []).map(t => ({ 
            revealed: t ? t.revealed : false, 
            type: (t && (t.revealed || p.socketId === receiver.socketId)) ? t.type : 'UNKNOWN' 
          }))
        };
      })
    };
    io.to(receiver.socketId).emit('court_sync', statePayload);
  });
}

function broadcastLog(roomCode, msg) {
  const time = new Date().toTimeString().split(' ')[0];
  const room = rooms[roomCode];
  if (room) {
    if (!room.gameLog) room.gameLog = [];
    room.gameLog.push({ time, msg });
  }
  io.to(roomCode).emit('court_log', { time, msg });
}

server.listen(3000, () => console.log('Salem 1692 Server ready: http://localhost:3000'));