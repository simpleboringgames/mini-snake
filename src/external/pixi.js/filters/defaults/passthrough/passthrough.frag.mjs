var fragment = "in vec2 vTextureCoord;\r\nout vec4 finalColor;\r\nuniform sampler2D uTexture;\r\nvoid main() {\r\n    finalColor = texture(uTexture, vTextureCoord);\r\n}\r\n";

export { fragment as default };
//# sourceMappingURL=passthrough.frag.mjs.map
