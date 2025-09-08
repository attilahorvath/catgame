import replace from '@rollup/plugin-replace';
import glsl from 'rollup-plugin-glsl';
import html from '@rollup/plugin-html';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    replace({
      include: [
        'src/**/*.js',
        'shaders/**/*.{vert,frag}'
      ],
      preventAssignment: true,

      MIN_WIDTH: '800',
      MIN_HEIGHT: '600',
      MAX_WIDTH: '2200',
      MAX_HEIGHT: '1000',
      LETTER_SIZE: '16.0',
      CELL_SIZE: '16.0',
      BUTTON_SIZE: '16.0',

      POSITION_ATTRIBUTE_LOCATION: '0',
      COLOR_ATTRIBUTE_LOCATION: '1',
      TEX_COORD_ATTRIBUTE_LOCATION: '2',
      SPRITE_POSITION_ATTRIBUTE_LOCATION: '3',
      SPRITE_SIZE_ATTRIBUTE_LOCATION: '4',
      SPRITE_TYPE_ATTRIBUTE_LOCATION: '5',
      SPRITE_COLOR_ATTRIBUTE_LOCATION: '6',
      SPRITE_ANGLE_ATTRIBUTE_LOCATION: '7'
    }),
    glsl({
      include: 'shaders/**/*.{vert,frag}'
    }),
    html({
      title: 'Cat Game'
    }),
    // terser()
  ]
};
