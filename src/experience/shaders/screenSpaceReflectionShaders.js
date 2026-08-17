/**
 * Screen Space Reflection Shader
 * Creates subtle reflections by sampling a mirrored-camera render target
 */

export const screenSpaceReflectionVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec4 vViewPosition;
  varying vec4 vScreenPos;

  void main() {
    vUv = uv;

    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    vViewPosition = viewMatrix * worldPosition;

    gl_Position = projectionMatrix * vViewPosition;

    vScreenPos = gl_Position;
  }
`

export const screenSpaceReflectionFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uScreenTexture;
  uniform float uMetalness;
  uniform float uRoughness;
  uniform float uReflectionStrength;
  uniform float uReflectionBlur;
  uniform vec3 uCameraPosition;
  uniform mat4 uMirrorProjectionMatrix;
  uniform mat4 uMirrorViewMatrix;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec4 vViewPosition;
  varying vec4 vScreenPos;

  void main() {
    vec4 baseColor = texture2D(uTexture, vUv);

    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);

    vec4 mirrorClipPos = uMirrorProjectionMatrix * uMirrorViewMatrix * vec4(vWorldPosition, 1.0);
    vec3 mirrorNDC = mirrorClipPos.xyz / mirrorClipPos.w;
    vec2 reflectionUV = mirrorNDC.xy * 0.5 + 0.5;

    bool validReflection = reflectionUV.x >= 0.0 && reflectionUV.x <= 1.0 &&
                          reflectionUV.y >= 0.0 && reflectionUV.y <= 1.0 &&
                          mirrorClipPos.w > 0.0;

    vec4 reflectionColor = vec4(0.0);

    if (validReflection) {
      if (uReflectionBlur > 0.0) {
        float blurSize = uReflectionBlur * 0.003;

        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(-blurSize, -blurSize)) * 0.0625;
        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(0.0, -blurSize)) * 0.125;
        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(blurSize, -blurSize)) * 0.0625;

        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(-blurSize, 0.0)) * 0.125;
        reflectionColor += texture2D(uScreenTexture, reflectionUV) * 0.25;
        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(blurSize, 0.0)) * 0.125;

        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(-blurSize, blurSize)) * 0.0625;
        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(0.0, blurSize)) * 0.125;
        reflectionColor += texture2D(uScreenTexture, reflectionUV + vec2(blurSize, blurSize)) * 0.0625;
      } else {
        reflectionColor = texture2D(uScreenTexture, reflectionUV);
      }
    }

    float edgeFade = smoothstep(0.0, 0.1, reflectionUV.x) *
                     smoothstep(1.0, 0.9, reflectionUV.x) *
                     smoothstep(0.0, 0.1, reflectionUV.y) *
                     smoothstep(1.0, 0.9, reflectionUV.y);

    vec3 normalizedNormal = normalize(vWorldNormal);
    float fresnel = pow(1.0 - max(dot(viewDir, normalizedNormal), 0.0), 2.0);

    float reflectionFactor = uMetalness * uReflectionStrength * edgeFade * (0.5 + fresnel * 0.5);
    reflectionFactor *= (1.0 - uRoughness);

    if (!validReflection) {
      reflectionFactor = 0.0;
    }

    vec3 finalColor = mix(baseColor.rgb, reflectionColor.rgb, reflectionFactor);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`
