const CopyShader = {

	name: 'CopyShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;


        vec4 Posterize(in vec4 inputColor){
            float gamma = 0.3f;
            float numColors = 8.0f;


            vec3 c = inputColor.rgb;
            c = pow(c, vec3(gamma, gamma, gamma));
            c = c * numColors;
            c = floor(c);
            c = c / numColors;
            c = pow(c, vec3(1.0/gamma));

            return vec4(c, inputColor.a);
        }


		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );

            int scanline = int(gl_FragCoord.y) / 2 % 2;
            if(scanline == 0){
                texel = vec4(0.0, 0.0, 0.0, 1.0);
            }

            gl_FragColor = Posterize(opacity * texel);
		}`

};

export { CopyShader };