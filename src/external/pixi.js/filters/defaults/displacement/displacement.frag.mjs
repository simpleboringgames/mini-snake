var fragment = "\r\nin vec2 vTextureCoord;\r\nin vec2 vFilterUv;\r\n\r\nout vec4 finalColor;\r\n\r\nuniform sampler2D uTexture;\r\nuniform sampler2D uMapTexture;\r\n\r\nuniform vec4 uInputClamp;\r\nuniform highp vec4 uInputSize;\r\nuniform mat2 uRotation;\r\nuniform vec2 uScale;\r\n\r\nvoid main()\r\n{\r\n    vec4 map = texture(uMapTexture, vFilterUv);\r\n    \r\n    vec2 offset = uInputSize.zw * (uRotation * (map.xy - 0.5)) * uScale; \r\n\r\n    finalColor = texture(uTexture, clamp(vTextureCoord + offset, uInputClamp.xy, uInputClamp.zw));\r\n}\r\n";

export { fragment as default };
//# sourceMappingURL=displacement.frag.mjs.map
