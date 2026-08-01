/**
 * Небесные тела: bg — заливка плитки, text — цвет числа,
 * art — цвет силуэта-подложки, icon — символ из спрайта.
 * Палитра согласована с обложкой игры.
 */
const TILE_STYLE = {
  2:     { bg: 'linear-gradient(150deg,#4A6FD0 0%,#3A57B4 100%)', text: '#FFFFFF', art: '#0B1B44', icon: 'b-dust',      glow: 'none' },
  4:     { bg: 'linear-gradient(150deg,#3A79E8 0%,#2A5DD0 100%)', text: '#FFFFFF', art: '#07173F', icon: 'b-meteor',    glow: 'none' },
  8:     { bg: 'linear-gradient(150deg,#2F97EE 0%,#1E76D6 100%)', text: '#FFFFFF', art: '#05204A', icon: 'b-asteroid',  glow: 'none' },
  16:    { bg: 'linear-gradient(150deg,#2FC2BE 0%,#189E9C 100%)', text: '#04322F', art: '#04322F', icon: 'b-comet',     glow: 'none' },
  32:    { bg: 'linear-gradient(150deg,#DCE4F2 0%,#BCC8DE 100%)', text: '#14203C', art: '#14203C', icon: 'b-moon',      glow: 'none' },
  64:    { bg: 'linear-gradient(150deg,#4FBE77 0%,#329B58 100%)', text: '#052A14', art: '#052A14', icon: 'b-planet',    glow: 'none' },
  128:   { bg: 'linear-gradient(150deg,#F5BE3C 0%,#DC9E18 100%)', text: '#3A2703', art: '#3A2703', icon: 'b-gasgiant',  glow: '0 0 18px rgba(245,190,60,0.4)' },
  256:   { bg: 'linear-gradient(150deg,#FFD86E 0%,#F5B928 100%)', text: '#402D00', art: '#402D00', icon: 'b-star',      glow: '0 0 24px rgba(255,216,110,0.55)' },
  512:   { bg: 'linear-gradient(150deg,#FF8A52 0%,#EE6326 100%)', text: '#3A1403', art: '#3A1403', icon: 'b-redgiant',  glow: '0 0 24px rgba(255,138,82,0.55)' },
  1024:  { bg: 'linear-gradient(150deg,#F76BA6 0%,#E23D82 100%)', text: '#40062A', art: '#40062A', icon: 'b-supernova', glow: '0 0 26px rgba(247,107,166,0.55)' },
  2048:  { bg: 'radial-gradient(circle at 50% 50%,#0A0518 0%,#0A0518 38%,#7B3FE4 62%,#C79BFF 100%)', text: '#FFFFFF', art: '#D9BBFF', icon: 'b-blackhole', glow: '0 0 32px rgba(150,90,255,0.7)' },
  4096:  { bg: 'linear-gradient(150deg,#C07BFF 0%,#9440E8 100%)', text: '#FFFFFF', art: '#2A0A50', icon: 'b-quasar',    glow: '0 0 28px rgba(170,100,255,0.6)' },
  8192:  { bg: 'linear-gradient(150deg,#4CE2F5 0%,#17B6D4 100%)', text: '#04323C', art: '#04323C', icon: 'b-galaxy',    glow: '0 0 28px rgba(76,226,245,0.6)' },
  16384: { bg: 'linear-gradient(150deg,#FFFFFF 0%,#D6E4FF 100%)', text: '#14203C', art: '#14203C', icon: 'b-galaxy',    glow: '0 0 30px rgba(255,255,255,0.7)' },
  32768: { bg: 'linear-gradient(150deg,#FFFFFF 0%,#EAF0FF 100%)', text: '#14203C', art: '#14203C', icon: 'b-galaxy',    glow: '0 0 34px rgba(255,255,255,0.8)' }
};

const LADDER_VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

const VECTORS = {
  up:    { r: -1, c: 0 },
  right: { r: 0,  c: 1 },
  down:  { r: 1,  c: 0 },
  left:  { r: 0,  c: -1 }
};

function tileStyle(value) {
  return TILE_STYLE[value] || TILE_STYLE[32768];
}

class Game {
  constructor(size) {
    this.size = size || 4;
    this.tiles = new Map();
    this.grid = [];
    this.nextId = 1;
    this.score = 0;
    this.won = false;
    this.keepPlaying = false;
    this.over = false;
    this.history = [];
    this.undoLimit = 3;
    this.undosLeft = this.undoLimit;
  }

  // ---------- Служебное ----------

  _emptyGrid() {
    const g = [];
    for (let r = 0; r < this.size; r++) {
      const row = [];
      for (let c = 0; c < this.size; c++) row.push(null);
      g.push(row);
    }
    return g;
  }

  _inBounds(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  _emptyCells() {
    const out = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === null) out.push({ r: r, c: c });
      }
    }
    return out;
  }

  // ---------- Партия ----------

  newGame(size) {
    if (size) this.size = size;
    this.grid = this._emptyGrid();
    this.tiles.clear();
    this.nextId = 1;
    this.score = 0;
    this.won = false;
    this.keepPlaying = false;
    this.over = false;
    this.history = [];
    this.undosLeft = this.undoLimit;
    const a = this._spawn();
    const b = this._spawn();
    return [a, b];
  }

  _spawn() {
    const cells = this._emptyCells();
    if (!cells.length) return null;
    const cell = cells[Math.floor(Math.random() * cells.length)];
    const tile = {
      id: this.nextId++,
      value: Math.random() < 0.9 ? 2 : 4,
      r: cell.r,
      c: cell.c
    };
    this.tiles.set(tile.id, tile);
    this.grid[cell.r][cell.c] = tile.id;
    return tile;
  }

  // ---------- Ход ----------

  _traversal(vec) {
    const rows = [];
    const cols = [];
    for (let i = 0; i < this.size; i++) { rows.push(i); cols.push(i); }
    if (vec.r === 1) rows.reverse();
    if (vec.c === 1) cols.reverse();
    const order = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        order.push({ r: rows[i], c: cols[j] });
      }
    }
    return order;
  }

  _findTarget(r, c, vec) {
    let fr = r, fc = c;
    let nr = r + vec.r, nc = c + vec.c;
    while (this._inBounds(nr, nc) && this.grid[nr][nc] === null) {
      fr = nr; fc = nc;
      nr += vec.r; nc += vec.c;
    }
    return {
      farthest: { r: fr, c: fc },
      next: this._inBounds(nr, nc) ? { r: nr, c: nc } : null
    };
  }

  /**
   * @returns {null|{slides,merges,ghosts,spawned,gained,maxValue}}
   *          null — если поле не изменилось
   */
  move(dir) {
    const vec = VECTORS[dir];
    if (!vec) return null;

    const before = this.serialize();
    const order = this._traversal(vec);
    const mergedNow = new Set();
    const result = {
      slides: [], merges: [], ghosts: [],
      spawned: null, gained: 0, maxValue: 0
    };
    let moved = false;

    for (let i = 0; i < order.length; i++) {
      const r = order[i].r;
      const c = order[i].c;
      const id = this.grid[r][c];
      if (id === null) continue;

      const tile = this.tiles.get(id);
      const path = this._findTarget(r, c, vec);
      const nextCell = path.next;
      const nextId = nextCell ? this.grid[nextCell.r][nextCell.c] : null;
      const nextTile = nextId !== null ? this.tiles.get(nextId) : null;

      if (nextTile && nextTile.value === tile.value && !mergedNow.has(nextTile.id)) {
        this.grid[r][c] = null;
        this.tiles.delete(id);
        nextTile.value *= 2;
        mergedNow.add(nextTile.id);

        result.ghosts.push({ id: id, r: nextCell.r, c: nextCell.c });
        result.merges.push({
          id: nextTile.id, value: nextTile.value,
          r: nextCell.r, c: nextCell.c
        });
        this.score += nextTile.value;
        result.gained += nextTile.value;
        moved = true;
      } else if (path.farthest.r !== r || path.farthest.c !== c) {
        this.grid[r][c] = null;
        this.grid[path.farthest.r][path.farthest.c] = id;
        tile.r = path.farthest.r;
        tile.c = path.farthest.c;
        result.slides.push({ id: id, r: tile.r, c: tile.c });
        moved = true;
      }
    }

    if (!moved) return null;

    this.history.push(before);
    if (this.history.length > 12) this.history.shift();

    result.spawned = this._spawn();
    result.maxValue = this.maxValue();
    if (result.maxValue >= 2048 && !this.won) this.won = true;
    this.over = !this.hasMoves();

    return result;
  }

  maxValue() {
    let max = 0;
    this.tiles.forEach(function (t) { if (t.value > max) max = t.value; });
    return max;
  }

  hasMoves() {
    if (this._emptyCells().length) return true;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const v = this.tiles.get(this.grid[r][c]).value;
        if (c + 1 < this.size && this.tiles.get(this.grid[r][c + 1]).value === v) return true;
        if (r + 1 < this.size && this.tiles.get(this.grid[r + 1][c]).value === v) return true;
      }
    }
    return false;
  }

  canUndo() {
    return this.history.length > 0 && this.undosLeft > 0;
  }

  undo() {
    if (!this.canUndo()) return false;
    const snap = this.history.pop();
    this.undosLeft--;
    this.deserialize(snap);
    return true;
  }

  grantUndo(count) {
    this.undosLeft += (count || 1);
  }

  // ---------- Сохранение ----------

  serialize() {
    const values = [];
    for (let r = 0; r < this.size; r++) {
      const row = [];
      for (let c = 0; c < this.size; c++) {
        const id = this.grid[r][c];
        row.push(id === null ? 0 : this.tiles.get(id).value);
      }
      values.push(row);
    }
    return {
      size: this.size,
      values: values,
      score: this.score,
      won: this.won,
      keepPlaying: this.keepPlaying
    };
  }

  deserialize(state) {
    if (!state || !state.values) return false;
    this.size = state.size || state.values.length;
    this.grid = this._emptyGrid();
    this.tiles.clear();
    this.nextId = 1;
    this.score = state.score || 0;
    this.won = !!state.won;
    this.keepPlaying = !!state.keepPlaying;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const v = state.values[r] ? state.values[r][c] : 0;
        if (v) {
          const tile = { id: this.nextId++, value: v, r: r, c: c };
          this.tiles.set(tile.id, tile);
          this.grid[r][c] = tile.id;
        }
      }
    }
    this.over = !this.hasMoves();
    return true;
  }
}
