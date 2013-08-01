<script type="x-shader/x-vertex">
	attribute vec3 aVertexPosition;
	//attribute vec4 aVertexColor;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	varying vec4 vColor;

	void main() {	  
	  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	  vColor = vec4(0.0, 0.0, 1.0, 1.0); //aVertexColor; 
	}          
</script>
