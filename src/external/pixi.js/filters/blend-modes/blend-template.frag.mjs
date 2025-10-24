var blendTemplateFrag = "\r\nin vec2 vTextureCoord;\r\nin vec4 vColor;\r\n\r\nout vec4 finalColor;\r\n\r\nuniform float uBlend;\r\n\r\nuniform sampler2D uTexture;\r\nuniform sampler2D uBackTexture;\r\n\r\n{FUNCTIONS}\r\n\r\nvoid main()\r\n{ \r\n    vec4 back = texture(uBackTexture, vTextureCoord);\r\n    vec4 front = texture(uTexture, vTextureCoord);\r\n    float blendedAlpha = front.a + back.a * (1.0 - front.a);\r\n    \r\n    {MAIN}\r\n}\r\n";

export { blendTemplateFrag as default };
//# sourceMappingURL=blend-template.frag.mjs.map
