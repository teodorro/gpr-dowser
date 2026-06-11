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
    const next = new Grid2D(this.rows, this.cols);
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
}

export default Grid2D;
