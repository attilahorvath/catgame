export default class Matrix3 extends Float32Array {
  static projection(width, height) {
    return new Matrix3([
      2.0 / width, 0.0, 0.0,
      0.0, -2.0 / height, 0.0,
      -1.0, 1.0, 1.0,
    ]);
  }
}
