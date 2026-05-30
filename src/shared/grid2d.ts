class Grid2D {
  rows: number;
  cols: number;
  private buf: Float32Array;

  constructor(rows: number, cols: number, data?: number[][]) {
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

  get(row: number, col: number): number {
    return this.buf[col * this.rows + row];
  }

  set(row: number, col: number, value: number) {
    this.buf[col * this.rows + row] = value;
  }

  getColumn(col: number): number[] {
    return Array.from({ length: this.rows }, (_, row) => this.get(row, col));
  }

  // Cheap copy for immutable store updates
  clone(): Grid2D {
    const next = new Grid2D(this.rows, this.cols);
    next.buf.set(this.buf); // TypedArray bulk copy, very fast
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
