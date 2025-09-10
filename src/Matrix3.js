export default class Matrix3 extends Float32Array {
  static identity() {
    return new Matrix3([
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
    ]);
  }

  static ortho(left, right, bottom, top) {
    return new Matrix3([
      2.0 / (right - left), 0.0, 0.0,
      0.0, 2.0 / (top - bottom), 0.0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), 1.0,
    ]);
  }
}
