var fragment = "\r\nin vec2 vTextureCoord;\r\n\r\nout vec4 finalColor;\r\n\r\nuniform float uAlpha;\r\nuniform sampler2D uTexture;\r\n\r\nvoid main()\r\n{\r\n    finalColor =  texture(uTexture, vTextureCoord) * uAlpha;\r\n}\r\n";

export { fragment as default };
//# sourceMappingURL=alpha.frag.mjs.map
