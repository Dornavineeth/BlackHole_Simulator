  var vertexShaderText = 
  [
      'precision mediump float;',
      '',
      'attribute vec2 vertPosition;',
      'attribute vec3 vertColor;',
      'varying vec3 fragColor;',
      '',
      'void main()',
      '{',
      'fragColor = vertColor;',
      ' gl_Position = vec4(vertPosition, 0.0, 1.0);',
      '}'
  ].join('\n');
  //var vertexShaderText = "precision mediump float;attribute vec2 vertPosition;attribute vec3 vertColor;varying vec3 fragColor;void main(){fragColor = vertColor;gl_Position = vec4(vertPosition, 0.0, 1.0);}";
   var fragmentShaderText = 
   [
       'precision mediump float;',
       '',
       'varying vec3 fragColor;',
       'void main()',
       '{',
       ' gl_FragColor = vec4(fragColor,1.0);',
       '}'
   ].join('\n');  
  
  var InitDemo = function(){
         console.log('this is working');
         var canvas = document.getElementById("game-surface");
         var gl = canvas.getContext('webgl');

         if(!gl){//becuase few web browsers dont support 
            //webgl and supports experimental-webgl
             gl= canvas.getContext('experimental-webgl')
         }
         if(!gl){
             alert('your browser doesnt support webgl')
         }

         gl.clearColor(0.75 , 0.85 , 0.8 , 1.0);
         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//creating shader
         var vertexShader = gl.createShader(gl.VERTEX_SHADER);
         var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(vertexShader,vertexShaderText);
gl.shaderSource(fragmentShader,fragmentShaderText);

gl.compileShader(vertexShader);
//check whether vertex shader is complied or not
if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
    console.error("ERROR compiling vertex shader",gl.getShaderInfoLog(vertexShader));
    return;
}
gl.compileShader(fragmentShader);
//check whether fragment shader is complied or not
if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
    console.error("ERROR compiling fragment shader",gl.getShaderInfoLog(fragmentShader));
    return;
} 

var program = gl.createProgram();
gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error("ERROR linking program",gl.getProgramInfoLog(program));
    return;
}
gl.validateProgram(program);
if(!gl.getProgramParameter(program,gl.VALIDATE_STATUS)){
    console.error('ERROR validating program',gl.getProgramInfoLog(program));
    return;
}
 
//create buffer
var triangleVertices = 
[//X,Y,   R,G,B
0.0,0.5,   1.0,1.0,0.0,
-0.5,-0.5,  0.7,0.0,1.0,
0.5,-0.5,   0.1,1.0,0.6,
];

var triangleVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(triangleVertices),gl.STATIC_DRAW);

var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
var colorAttribLocation =  gl.getAttribLocation(program,'vertColor');
gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    2,//no of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,// size of individual vertex
    0 //offset from the beginnig of a single vetex to this aattribute
  );

  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3 ,//no of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,// size of individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT //offset from the beginnig of a single vetex to this aattribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation); 
//main render loop
 
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES,0,3);//what shapes to be drawn,skip vertices,no of vertices

};
  