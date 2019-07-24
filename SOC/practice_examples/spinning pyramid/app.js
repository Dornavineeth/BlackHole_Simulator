var vertexShaderText = 
['precision mediump float;',
'',
 'attribute vec3 vertPosition;',
 'attribute vec3 vertColor;',
 'varying vec3 fragColor;',
 'uniform mat4 mWorld;',
 'uniform mat4 mView;',
 'uniform mat4 mProj;',
 'void main(){',
 'gl_Position = mProj * mView * mWorld * vec4(vertPosition,1.0);',
 'fragColor = vertColor;}'
].join('\n');

var fragmentShaderText = 
[
 'precision mediump float;',
 'varying vec3 fragColor;',
 'void main(){',
 'gl_FragColor = vec4(fragColor,1.0);}'
].join('\n');

var gl;
function InitDemo(){
    console.log("this is working");
    var canvas = document.getElementById("game-surface");
    gl = canvas.getContext("webgl");
    gl.clearColor(0.55,0.75,0.85,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader,vertexShaderText);
    gl.shaderSource(fragmentShader,fragmentShaderText);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
        console.error("error in compiling vertex shader");
        return;
    }
    if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
        console.error("error in compiling fragment shader");
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        console.error("error in linking shaders in program");
        return;
    }

    var recVertices = 
    [  //bottom
        -0.5,0.5,0.0 , 0.95,0.75,0.85,
        0.5,0.5,0.0 , 0.95,0.75,0.85,
        0.5,-0.5,0.0 , 0.95,0.75,0.85,
        -0.5,-0.5,0.0 , 0.95,0.75,0.85,

        //left
        0.0,0.0,1.0 , 0.55,0.45,0.75,
        -0.5,0.5,0.0 , 0.55,0.45,0.75,
        -0.5,-0.5,0.0 , 0.55,0.45,0.75,

        //right

        0.0,0.0,1.0 , 0.95,0.45,0.75,
        0.5,0.5,0.0 , 0.95,0.45,0.75,
        0.5,-0.5,0.0 , 0.95,0.45,0.75,
  
        //front 

        0.0,0.0,1.0 , 0.95,0.85,0.75,
        0.5,0.5,0.0 , 0.95,0.85,0.75,
        -0.5,0.5,0.0 , 0.95,0.85,0.75,

        //back

        0.0,0.0,1.0 , 0.95,0.45,0.15,
        0.5,-0.5,0.0 , 0.95,0.45,0.15,
        -0.5,-0.5,0.0 , 0.95,0.45,0.15


    ];
 
    var recIndices = 
    [
      0,1,2,
      0,2,3,
      4,5,6,
      7,8,9,
      10,11,12,
      13,14,15,
    ];

    var recvertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,recvertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(recVertices),gl.STATIC_DRAW);

    var recIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,recIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(recIndices),gl.STATIC_DRAW)

    var positionAttribLocation = gl.getAttribLocation(program,"vertPosition");
    var colorAttribLocation = gl.getAttribLocation(program,"vertColor");

    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    )

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.useProgram(program);

    var worldUniformLocation = gl.getUniformLocation(program,"mWorld");
    var viewUniformLocation = gl.getUniformLocation(program,"mView");
    var projUniformLocation = gl.getUniformLocation(program,"mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMatrix);
    //glMatrix.mat4.identity(viewMatrix);
    glMatrix.mat4.lookAt(viewMatrix,[0,0,3],[0,0,0],[0,1,0]);//see documentation in glmatrix.net
    glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.perspective(projMatrix,glMatrix.glMatrix.toRadian(45),canvas.width/canvas.clientHeight,0.1,1000.0);

    gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMatrix); 
    gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, projMatrix);
    
    var xrotationMatrix = new Float32Array(16);
    var yrotationMatrix = new Float32Array(16);
    var zrotationMatrix = new Float32Array(16);

    glMatrix.mat4.identity(xrotationMatrix);
    glMatrix.mat4.identity(yrotationMatrix);
    glMatrix.mat4.identity(zrotationMatrix);

    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);

    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  
    var angle = 0; 
    var loop = function(){
        angle = (performance.now()/(6 * 1000)) * 2 * Math.PI;
        glMatrix.mat4.rotate(xrotationMatrix,identityMatrix,angle,[1,0,0]);
        glMatrix.mat4.rotate(yrotationMatrix,identityMatrix,angle,[0,1,0]);
        glMatrix.mat4.mul(worldMatrix,xrotationMatrix,yrotationMatrix);
        gl.uniformMatrix4fv(worldUniformLocation,gl.FALSE,worldMatrix);
        gl.clearColor(0.55,0.75,0.85,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES,recIndices.length,gl.UNSIGNED_SHORT,0);
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

}