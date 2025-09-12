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
      preventAssignment: false,

      IMAGE_SIZE: '16.0',

      POSITION_ATTRIBUTE_LOCATION: '0',
      COLOR_ATTRIBUTE_LOCATION: '1',
      TEX_COORD_ATTRIBUTE_LOCATION: '2',
      SPRITE_POSITION_ATTRIBUTE_LOCATION: '3',
      SPRITE_SIZE_ATTRIBUTE_LOCATION: '4',
      SPRITE_TYPE_ATTRIBUTE_LOCATION: '5',
      SPRITE_COLOR_ATTRIBUTE_LOCATION: '6',
      SPRITE_ANGLE_ATTRIBUTE_LOCATION: '7',

      'imageSize': 'is',

      'vertexPosition': 'vp',
      'vertexTexCoord': 'vt',
      'spritePosition': 'sp',
      'spriteSize': 'ss',
      'spriteType': 'st',
      'spriteColor': 'sc',
      'spriteAngle': 'sa',

      'texCoord': 'tc',
      'fragmentColor': 'fc',

      'update': 'u',
      'draw': 'd',
      'write': 'w',
      // 'clear': 'c',

      'setColor': 'cc',
      'setBaseColor': 'cb',

      'catName': 'cn',
      'catText': 'ct',
      'response': 'cr',

      'scheduleTimer': 'tt',

      'setAttribute': 'a',
      'changed': 'c',

      // 'renderer': 'r',
      // 'text': 't',

      'view': 'v',
      'projection': 'p',

      'center': 'c',

      PRIMARY_COLOR: '0',
      BACKGROUND_COLOR: '1',
      HIGHLIGHT_COLOR: '2',
      ACTIVE_COLOR: '3',
      INACTIVE_COLOR: '4',

      BLACKCAT_COLOR: '5',
      ORANGECAT_COLOR: '6',
      WHITECAT_COLOR: '7',
      TABBYCAT_COLOR: '8',
      SILVERCAT_COLOR: '9',

      INACTIVE1_COLOR: '10',
      INACTIVE2_COLOR: '11',
      INACTIVE3_COLOR: '12',
      INACTIVE4_COLOR: '13',
      INACTIVE5_COLOR: '14',
      INACTIVE6_COLOR: '15',
      INACTIVE7_COLOR: '16',
      INACTIVE8_COLOR: '17',
      INACTIVE9_COLOR: '18',
      INACTIVE10_COLOR: '19',

      VOID_COLOR: '20',
    }),
    glsl({
      include: 'shaders/**/*.{vert,frag}'
    }),
    html({
      title: 'Cat Game'
    }),
    terser()
  ]
};
