var fragment = "varying vec2 vUV;\r\nvarying vec4 vColor;\r\n\r\nuniform sampler2D uTexture;\r\n\r\nvoid main(void){\r\n    vec4 color = texture2D(uTexture, vUV) * vColor;\r\n    gl_FragColor = color;\r\n}";

export { fragment as default };
//# sourceMappingURL=particles.frag.mjs.map
