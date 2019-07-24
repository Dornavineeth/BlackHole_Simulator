  var vertexShaderText = 
  [
      'precision mediump float;',
      '',
      'attribute vec3 vertPosition;',
      'attribute vec3 vertColor;',
      'varying vec3 fragColor;',
      'uniform mat4 mWorld;',
      'uniform mat4 mView;',
      'uniform mat4 mProj;',
      '',
      'void main()',
      '{', 
      'fragColor = vertColor;',
      ' gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
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

   var gl ;
  
  var InitDemo = function(){
         console.log('this is working');
         var canvas = document.getElementById("game-surface");
         gl = canvas.getContext('webgl');

         if(!gl){//becuase few web browsers dont support 
            //webgl and supports experimental-webgl
             gl= canvas.getContext('experimental-webgl')
         }
         if(!gl){
             alert('your browser doesnt support webgl')
         }

         gl.clearColor(0.75 , 0.85 , 0.8 , 1.0);
         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
         gl.enable(gl.DEPTH_TEST);
         gl.enable(gl.CULL_FACE);
         gl.frontFace(gl.CCW);
         gl.cullFace(gl.BACK);
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
var boxVertices  = 
[//X,Y,z   R,G,B
//Top
-1.0,1.0,-1.0,  0.5,0.5,0.5,
-1.0,1.0,1.0,  0.5,0.5,0.5,
1.0,1.0,1.0,  0.5,0.5,0.5,
1.0,1.0,-1.0,  0.5,0.5,0.5,

//left
-1.0,1.0,1.0,  0.75,0.25,0.5,
-1.0,-1.0,1.0,  0.75,0.25,0.5,
-1.0,-1.0,-1.0,  0.75,0.25,0.5,
-1.0,1.0,-1.0,  0.75,0.25,0.5,

//right
1.0,1.0,1.0,  0.25,0.25,0.75,
1.0,-1.0,1.0,  0.25,0.25,0.75,
1.0,-1.0,-1.0,  0.25,0.25,0.75,
1.0,1.0,-1.0,  0.25,0.25,0.75,

//front
1.0,1.0,1.0,  1.0,0.0,0.15,
1.0,-1.0,1.0,  1.0,0.0,0.15,
-1.0,-1.0,1.0,  1.0,0.0,0.15,
-1.0,1.0,1.0,  1.0,0.0,0.15,

//back
1.0,1.0,-1.0,  0.0,1.0,0.15,
1.0,-1.0,-1.0,  0.0,1.0,0.15,
-1.0,-1.0,-1.0,  0.0,1.0,0.15,
-1.0,1.0,-1.0,  0.0,1.0,0.15,

//bottom
-1.0,-1.0,-1.0,  0.5,0.5,1.0,
-1.0,-1.0,1.0,  0.5,0.5,1.0,
1.0,-1.0,1.0,  0.5,0.5,1.0,
1.0,-1.0,-1.0,  0.5,0.5,1.0,
];

var boxIndices = 
[
    //top
    0,1,2,
    0,2,3,

    //left
    5,4,6,
    6,4,7,

    //right
    8,9,10,
    8,10,11,

    //front
    13,12,14,
    15,14,12,

    //back
    16,17,18,
    16,18,19,

    //bottom
    21,20,22,
    22,20,23
]; 
var boxVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,boxVertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(boxVertices),gl.STATIC_DRAW);

var boxIndexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,boxIndexBufferObject);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(boxIndices),gl.STATIC_DRAW);

var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
var colorAttribLocation =  gl.getAttribLocation(program,'vertColor');
gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3,//no of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,// size of individual vertex
    0 //offset from the beginnig of a single vetex to this aattribute
  );

  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3 ,//no of elements per attribute
    gl.FLOAT,//type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,// size of individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginnig of a single vetex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation); 
//main render loop

gl.useProgram(program);

var matWorldUniformLocation = gl.getUniformLocation(program ,'mWorld');
var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
var matProjUniformLocation = gl.getUniformLocation(program,'mProj');

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);

glMatrix.mat4.identity(worldMatrix);
glMatrix.mat4.lookAt(viewMatrix,[0,0,-8],[0,0,0],[0,1,0]);//see documentation in glmatrix.net
glMatrix.mat4.identity(projMatrix);
glMatrix.mat4.perspective(projMatrix,glMatrix.glMatrix.toRadian(45),canvas.width/canvas.clientHeight,0.1,1000.0);

gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

var xRotationMatrix = new Float32Array(16);
var yRotationMatrix = new Float32Array(16);
var zRotationMatrix = new Float32Array(16);

var identityMatrix = new Float32Array(16);
glMatrix.mat4.identity(identityMatrix);
var angle = 0 ;
var loop = function () {
    var angle = performance.now() /1000/12 *  2  * Math.PI;
    glMatrix.mat4.rotate(yRotationMatrix,identityMatrix,angle,[0,1,0]);
    glMatrix.mat4.rotate(xRotationMatrix,identityMatrix,angle,[1,0,0]);
    glMatrix.mat4.mul(worldMatrix,yRotationMatrix,xRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation,gl.FALSE,worldMatrix);
    gl.clearColor(0.75 , 0.85 , 0.8 , 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES,boxIndices.length,gl.UNSIGNED_SHORT,0);
    requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
};
  