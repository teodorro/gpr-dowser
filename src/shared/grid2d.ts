class Grid2D {
  rows: number;
  cols: number;
  private buf: Float32Array;

  constructor(cols: number, rows: number, data?: number[][]) {
    this.rows = rows;
    this.cols = cols;
    this.buf = new Float32Array(rows * cols);
    if (data && data.length === cols) {
      data.forEach((col, colIndex) => {
        col.forEach((value, rowIndex) => {
          this.set(colIndex, rowIndex, value);
        });
      });
    }
  }

  get(col: number, row: number): number {
    return this.buf[col * this.rows + row];
  }

  set(col: number, row: number, value: number) {
    this.buf[col * this.rows + row] = value;
  }

  getColumn(col: number): number[] {
    return Array.from({ length: this.rows }, (_, row) => this.get(col, row));
  }

  // Cheap copy for immutable store updates
  clone(): Grid2D {
    const next = new Grid2D(this.cols, this.rows);
    next.buf.set(this.buf);
    return next;
  }

  // Direct buffer access for workers / WebGL upload
  get buffer(): Float32Array {
    return this.buf;
  }

  static fromArray(array: number[][]): Grid2D {
    return new Grid2D(array.length, array[0].length, array);
  }

  split(index: number): [Grid2D, Grid2D] {
    if (index < 0 || index > this.cols) {
      throw new RangeError('Split index is out of bounds');
    }

    const left = new Grid2D(index, this.rows);
    const right = new Grid2D(this.cols - index, this.rows);
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        if (col < index) {
          left.set(col, row, this.get(col, row));
        } else {
          right.set(col - index, row, this.get(col, row));
        }
      }
    }
    return [left, right];
  }
}

export default Grid2D;
