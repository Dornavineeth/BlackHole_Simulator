function clamp( x, xmin, xmax )
{
    return Math.min( Math.max( x, xmin ), xmax );
}
WGLViewer = function( canvas_id, controls_id )
{
    //  A WebGL context
    if( controls_id )
    this.controls = document.getElementById( controls_id );
    this.canvas = document.getElementById( canvas_id );
    this.canvas.width  = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.gl = this.canvas.getContext('webgl');
    // set up various listeners, using event listener on window to make sure we don't overwrite someone else's
    window.addEventListener( 'resize', (function( ) { window.requestAnimationFrame( this.boundRedraw ); }).bind( this ) );  // asynchronously repaint when resizing
    window.addEventListener( 'pagehide', this.saveState.bind( this ) );
    window.addEventListener( 'unload', this.saveState.bind( this ) );
    window.addEventListener( 'popstate', (function( e ) { this.restoreState( e.state ) }).bind( this ) );

    //this.canvas.onmousedown = this.canvas.ontouchstart = this.mousedown.bind( this );
    //this.canvas.onmouseup = this.canvas.ontouchend = this.mouseup.bind( this );
    //this.canvas.onwheel = this.wheel.bind( this );    // this is confusing with scrolling
    //canvas.addEventListener( 'dragenter', this.dragenter.bind( this ), false );     // drag and drop listeners
    //canvas.addEventListener( 'dragleave', this.dragleave.bind( this ), false );
    //canvas.addEventListener( 'dragover', this.dragover.bind( this ), false );
    //canvas.addEventListener( 'drop', this.drop.bind( this ), false );
    // pre-bind some commonly used functions
    this.boundAnim = this.animate.bind( this );
    this.boundRedraw = this.redraw.bind( this );
    //this.boundMM = this.mousemove.bind( this );
    //this.boundCO = this.changeOrientation.bind( this );

    // setup GLSL shaders
    var vshader            = this.gl.createShader( this.gl.VERTEX_SHADER );
    var fshader            = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    var fshaderTh          = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    var fshader360         = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    var fshader360th       = this.gl.createShader( this.gl.FRAGMENT_SHADER );
    var vshaderSource      = document.getElementById( 'blackhole-vertex-shader' ).text;
    var fshaderSource      = document.getElementById( 'blackhole-fragment-shader' ).text.replace( 'void mainNormal(', 'void main(' );
    var fshaderSourceTh    = document.getElementById( 'blackhole-fragment-shader' ).text.replace( 'void mainTh(', 'void main(' );
    var fshaderSource360   = document.getElementById( 'blackhole-fragment-shader' ).text.replace( 'void main360(', 'void main(' );
    var fshaderSource360th = document.getElementById( 'blackhole-fragment-shader' ).text.replace( 'void main360Th(', 'void main(' );
    this.gl.shaderSource( vshader, vshaderSource );
    this.gl.compileShader( vshader );
    this.gl.shaderSource( fshader, fshaderSource );
    this.gl.compileShader( fshader );
    this.gl.shaderSource( fshaderTh, fshaderSourceTh );
    this.gl.compileShader( fshaderTh );
    this.gl.shaderSource( fshader360, fshaderSource360 );
    this.gl.compileShader( fshader360 );
    this.gl.shaderSource( fshader360th, fshaderSource360th );
    this.gl.compileShader( fshader360th );
    
    // provide coordinates for the rectangle. Texture coordinates are derived in vertex shader.
    var buffer = this.gl.createBuffer( );
    this.gl.bindBuffer( this.gl.ARRAY_BUFFER, buffer );
    this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array(
        [ -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
           1.0,  1.0 ] ), this.gl.STATIC_DRAW );

    // Create a textures and set the parameters so we can render any size image.
    this.blackhole_texture = this.gl.createTexture( );
    this.gl.activeTexture( this.gl.TEXTURE0 );
    this.gl.bindTexture( this.gl.TEXTURE_2D, this.blackhole_texture );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST );

    this.background_texture = this.gl.createTexture( );
    this.gl.activeTexture( this.gl.TEXTURE1 );
    this.gl.bindTexture( this.gl.TEXTURE_2D, this.background_texture );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR );
    this.gl.texParameteri( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR );

    // normal view program
    this.program = this.gl.createProgram( );
    this.gl.attachShader( this.program, vshader );
    this.gl.attachShader( this.program, fshader );
    this.gl.linkProgram( this.program );
    this.gl.useProgram( this.program );

    var positionLoc = this.gl.getAttribLocation( this.program, 'a_position' );
    this.gl.enableVertexAttribArray( positionLoc );
    this.gl.vertexAttribPointer( positionLoc, 2, this.gl.FLOAT, false, 0, 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program, 'u_blackhole' ), 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program, 'u_background' ), 1 );

    // normal view Theta program 
    this.programTh = this.gl.createProgram( );
    this.gl.attachShader( this.programTh, vshader );
    this.gl.attachShader( this.programTh, fshaderTh );
    this.gl.linkProgram( this.programTh );
    this.gl.useProgram( this.programTh );

    positionLoc = this.gl.getAttribLocation( this.programTh, 'a_position' );
    this.gl.enableVertexAttribArray( positionLoc );
    this.gl.vertexAttribPointer( positionLoc, 2, this.gl.FLOAT, false, 0, 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.programTh, 'u_blackhole' ), 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.programTh, 'u_background' ), 1 );

    // 360 VR view program
    this.program360 = this.gl.createProgram( );
    this.gl.attachShader( this.program360, vshader );
    this.gl.attachShader( this.program360, fshader360 );
    this.gl.linkProgram( this.program360 );
    this.gl.useProgram( this.program360 );

    var positionLoc = this.gl.getAttribLocation( this.program360, 'a_position' );
    this.gl.enableVertexAttribArray( positionLoc );
    this.gl.vertexAttribPointer( positionLoc, 2, this.gl.FLOAT, false, 0, 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program360, 'u_blackhole' ), 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program360, 'u_background' ), 1 );

    // 360 VR Theta view program (for Ricoh Theta S camera)
    this.program360th = this.gl.createProgram( );
    this.gl.attachShader( this.program360th, vshader );
    this.gl.attachShader( this.program360th, fshader360th );
    this.gl.linkProgram( this.program360th );
    this.gl.useProgram( this.program360th );

    var positionLoc = this.gl.getAttribLocation( this.program360th, 'a_position' );
    this.gl.enableVertexAttribArray( positionLoc );
    this.gl.vertexAttribPointer( positionLoc, 2, this.gl.FLOAT, false, 0, 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program360th, 'u_blackhole' ), 0 );
    this.gl.uniform1i( this.gl.getUniformLocation( this.program360th, 'u_background' ), 1 );

    // images initially used for the textures
    this.blackhole_image = new Image( );
    this.blackhole_image.onload = (function( ) { this.updateTexture( this.gl.TEXTURE0, this.blackhole_image ); this.redraw( ); }).bind( this );

    this.background_image = new Image( );
    this.background_image.onload = (function( ) { this.updateTexture( this.gl.TEXTURE1, this.background_image ); this.redraw( ); }).bind( this );

    // a video from where we can get the video background if needed
    this.background_video = document.createElement( 'video' );
    this.background_video.autoplay = true;

    this.background_video.width = 1280;     
    this.background_video.height = 720;

    // set some values, will use default state if no saved state is available
    var state = null;
    if( window.location.search && window.location.search.substring( 0, 7 ) == '?state=' )
        state = JSON.parse( atob( window.location.search.substring( 7 ) ) )
    else if( history.state && history.state.shift )
        state = history.state;      // ensure that the state is not all undefined as seems to be the case for URLs with hash in Firefox
    this.restoreState( state );
};

WGLViewer.prototype.defaultState = {
    blackhole_image: 'textures/2vr.png',
    background_image: 'backgrounds/milkyway.jpg',
    fov: [0.5, 0.5],
    zoom: 1/0.3,
    view: [0.65, 0.44],
    vm: [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ],
    shift: [ 0.0, 0.0 ],
    sm: [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ],
    fov360: [0.2,0.5],
    dx: 0.0,
    dy: 0.0,
    s_dx: 0.0,
    s_dy: 0.0,
    v_dx: 0.05,
    v_dy: 0.05,
    vrmode: true,
    tracking: false,
    thetaMode: false,
};

WGLViewer.prototype.getState = function( )
{
    return { blackhole_image: this.blackhole_image.src,
             background_image: this.background_image.src,
             fov: this.fov,
             zoom: this.zoom,
             view: this.view,
             vm: this.vm,
             shift: this.shift,
             sm: this.sm,
             fov360: this.fov360,
             dx: this.dx,
             dy: this.dy,
             s_dx: this.s_dx,
             s_dy: this.s_dy,
             v_dx: this.v_dx,
             v_dy: this.v_dy,
             vrmode: this.vrmode,
             tracking: this.tracking,
             thetaMode: this.thetaMode, };
};


WGLViewer.prototype.saveState = function( )
{
    history.replaceState( this.getState( ), 'saved blackhole state' );
};

WGLViewer.prototype.restoreState = function( state )
{
    if( !state )
        state = this.defaultState;
    this.canvas.parentElement.classList.remove( 'complete' );
    this.blackhole_image.src = state.blackhole_image;
    this.background_image.src = state.background_image;
    this.fov = state.fov;
    this.zoom = state.zoom;
    this.view = state.view;
    this.vm = state.vm;
    this.shift = state.shift;
    this.sm = state.sm;
    this.fov360 = state.fov360;
    this.dx = state.dx;
    this.dy = state.dy;
    this.s_dx = state.s_dx;
    this.s_dy = state.s_dy;
    this.v_dx = state.v_dx;
    this.v_dy = state.v_dy;
    this.last = null;

    this.setMode( state.vrmode, state.thetaMode );
    this.trackHandset( state.tracking );
    this.animate( );    // start animation if necessary
};

WGLViewer.prototype.setMode = function( vrmode, thetaMode )
{
    if( thetaMode == null )
        thetaMode = false;
    this.thetaMode = thetaMode;
    this.vrmode = vrmode;

    var prog = null;

    if( this.vrmode )
    {
        prog = this.thetaMode ? this.program360th : this.program360;
        this.canvas.parentElement.classList.add( 'vr360' );
        if( this.controls )
            this.controls.classList.add( 'vr360' );
    }
    else
    {
        prog = this.thetaMode ? this.programTh : this.program;
        this.canvas.parentElement.classList.remove( 'vr360' );
        if( this.controls )
            this.controls.classList.remove( 'vr360' );
    }

    // load current program and set variable locations
    this.gl.useProgram( prog );
    this.fovLoc = this.gl.getUniformLocation( prog, 'u_fov' );          
    this.viewLoc = this.gl.getUniformLocation( prog, 'u_view' );        
    this.textureSizeLoc = this.gl.getUniformLocation( prog, 'u_bhsize' );  
    this.smLoc = this.gl.getUniformLocation( prog, 'u_sm' );       
    this.vmLoc = this.gl.getUniformLocation( prog, 'u_vm' );     

    this.redraw( );
};

WGLViewer.prototype.trackHandset = function( mode )
{
    this.tracking = mode;
    if( !window.DeviceOrientationEvent )
        return;

    if( mode )
    {
        window.addEventListener( 'deviceorientation', this.boundCO );
        this.s_dx = this.s_dy = this.dx = this.dy = this.v_dx = this.v_dy = 0.0;
        this.animate( );
    }
    else
        window.removeEventListener( 'deviceorientation', this.boundCO );
};

// update all settings that affect the view in the current program, adjusting them as needed. Then redraw the WebGL view.
WGLViewer.prototype.redraw = function( )
{
    var w = this.canvas.width,
        h = this.canvas.height;

    // update canvas size if layout changed
    if( w != this.canvas.clientWidth || h != this.canvas.clientHeight )
    {
        w = this.canvas.width = this.canvas.clientWidth;
        h = this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport( 0.0, 0.0, w, h );
    }

    // compute shift matrix
    this.shift[0] = this.shift[0]%1.0;
    this.shift[1] = this.shift[1]%1.0;
    var sp = Math.sin( 2.0*Math.PI*this.shift[0] ),
        cp = Math.cos( 2.0*Math.PI*this.shift[0] ),
        st = Math.sin( 2.0*Math.PI*this.shift[1] ),
        ct = Math.cos( 2.0*Math.PI*this.shift[1] );
    this.sm = [ cp*ct, sp*ct, st, -sp, cp, 0.0, -cp*st, -sp*st, ct ];   // column major!

    // compute view matrix
    this.view[0] = this.vrmode ? this.view[0]%1.0 : clamp( this.view[0], 0.0, 1.0 );
    this.view[1] = clamp( this.view[1], 0.0, 1.0 );
    sp = Math.sin( 2.0*Math.PI*this.view[0] );
    cp = Math.cos( 2.0*Math.PI*this.view[0] );
    st = Math.sin( Math.PI*(this.view[1]-0.5) );        // we want equator in the center
    ct = Math.cos( Math.PI*(this.view[1]-0.5) );
    this.vm = [ cp*ct, sp*ct, st, -sp, cp, 0.0, -cp*st, -sp*st, ct ];   // column major!

    if( this.vrmode )
    {
        var aspectRatio = (w > h) ? [ 1.0, h/w ] : [ w/h, 1.0 ],
            fov = [ 2.0*Math.PI*this.zoom*aspectRatio[0]*this.fov360[0], Math.PI*this.zoom*aspectRatio[1]*this.fov360[1] ],
            view = this.view;    // ignored in 360 shader
    }
    else
    {
        var z = Math.min( 1.0, this.zoom ),             // only allow zooming in
            fov = [ z*this.fov[0], z*this.fov[1] ],
            view = [ clamp( this.view[0], z*this.fov[0], 1.0-z*this.fov[0] ),
                     clamp( this.view[1], z*this.fov[1], 1.0-z*this.fov[1] ) ];
    }

    this.gl.uniform2f( this.textureSizeLoc, this.blackhole_image.width, this.blackhole_image.height );
    this.gl.uniform2fv( this.fovLoc, fov );
    this.gl.uniform2fv( this.viewLoc, view );
    this.gl.uniformMatrix3fv( this.smLoc, false, this.sm );
    this.gl.uniformMatrix3fv( this.vmLoc, false, this.vm );

    // actually trigger a redraw
    this.gl.drawArrays( this.gl.TRIANGLE_STRIP, 0, 4 );
};


// update texture but do not automatically redraw!
WGLViewer.prototype.updateTexture = function( texture, image )
{
    if( (image.nodeName == "IMG" && !image.complete) ||         // skip incomplete images
        (image.nodeName == "VIDEO" && image.readyState < 2) )   // skip incomplete videos
        return;

    if( (this.canvas.parentElement.className.indexOf( 'complete' ) == -1) && this.background_image.complete && this.blackhole_image.complete )
        this.canvas.parentElement.classList.add( 'complete' );

    // copy the image content into WebGL buffer
    this.gl.activeTexture( texture );
    this.gl.pixelStorei( this.gl.UNPACK_FLIP_Y_WEBGL, true );
    this.gl.pixelStorei( this.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.gl.NONE );
    this.gl.texImage2D( this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image );
    if( this.gl.getError( ) != this.gl.NO_ERROR )
        alert( "There was an error loading the image as a texture, probably the image is too large for this WebGL implementation. Please try a different browser such as Google's Chrome, Mozilla's Firefox, Opera, Apple's Safari, or Microsoft's Edge." );
};

WGLViewer.prototype.animate = function( time )
{
    if( this.tracking || (this.s_dx || 0*this.s_dy) || (this.v_dx || 0*this.v_dy) )  // for now dectivate animation in theta component
    {
        if( this.last )
            dt = (time-this.last)/1000.0;
        else
            dt = 0.0;
        // limit frame rate to a maximum of 30 fps
        if( !this.last || dt >= 1.0/30.0 )
        {
            if( this.s_dx || this.s_dy )
                this.shift = [ this.shift[0]-dt*this.s_dx, this.shift[1]-dt*this.s_dy*0 ];  // dectivate animation in theta component
            if( this.v_dx || this.v_dy )
                this.view = [ this.view[0]-dt*this.v_dx, this.view[1]+dt*this.v_dy*0 ];  // dectivate animation in theta component
            this.redraw( );
            this.last = time;
        }
        window.requestAnimationFrame( this.boundAnim );
    }
};






