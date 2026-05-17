<template>
  <Teleport to="body">
    <Transition name="avatar-modal">
      <div v-if="isOpen" class="avm-overlay" @click.self="handleClose">
        <div class="avm-box">

          <!-- Header -->
          <div class="avm-header">
            <h3 class="avm-title">Foto de perfil</h3>
            <button class="avm-close" @click="handleClose" :disabled="uploading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Paso 1: sin imagen seleccionada -->
          <div v-if="!selectedFile" class="avm-body">
            <div
              class="avm-drop"
              :class="{ 'avm-drop--dragging': dragging }"
              @click="triggerInput"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="onDrop"
            >
              <!-- Preview actual del avatar -->
              <div class="avm-current-avatar">
                <img v-if="currentAvatarUrl" :src="currentAvatarUrl" class="avm-current-img" alt="Avatar actual" />
                <span v-else class="avm-current-initials">{{ initials }}</span>
              </div>
              <p class="avm-drop-text">
                <strong>Haz clic o arrastra tu foto aquí</strong>
              </p>
              <p class="avm-drop-hint">JPG o PNG · Máx. 5 MB</p>
            </div>

            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              style="display:none"
              @change="onFileChange"
            />

            <p v-if="fileError" class="avm-error">{{ fileError }}</p>

            <!-- Opción de quitar foto (solo si tiene una) -->
            <div v-if="currentAvatarUrl" class="avm-remove-row">
              <button class="avm-btn-remove" @click="confirmRemove" :disabled="uploading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
                Quitar foto de perfil
              </button>
            </div>
          </div>

          <!-- Paso 2: recorte -->
          <div v-else class="avm-body avm-body--crop">
            <p class="avm-crop-hint">Arrastra para encuadrar · Usa la rueda para hacer zoom</p>

            <!-- Canvas de preview de recorte -->
            <div class="avm-crop-wrap">
              <canvas
                ref="cropCanvas"
                class="avm-crop-canvas"
                @mousedown="startDrag"
                @mousemove="onDragMove"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
                @wheel.prevent="onWheel"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend="stopDrag"
              ></canvas>
              <!-- Overlay circular -->
              <div class="avm-crop-overlay"></div>
            </div>

            <p class="avm-filename">{{ selectedFile.name }}</p>

            <!-- Acciones -->
            <div class="avm-actions">
              <button class="avm-btn-secondary" @click="cancelCrop" :disabled="uploading">
                Cancelar
              </button>
              <button class="avm-btn-primary" @click="uploadCropped" :disabled="uploading">
                <svg v-if="uploading" class="avm-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ uploading ? 'Subiendo...' : 'Confirmar foto' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { userService } from '../../services/api.js'

// ─── Props / Emits ─────────────────────────────────────────────────────────
const props = defineProps({
  isOpen:           { type: Boolean, default: false },
  currentAvatarUrl: { type: String,  default: '' },
  initials:         { type: String,  default: 'E' },
})
const emit = defineEmits(['close', 'avatar-updated', 'avatar-removed'])

// ─── Estado general ────────────────────────────────────────────────────────
const fileInputRef = ref(null)
const selectedFile = ref(null)
const fileError    = ref('')
const uploading    = ref(false)
const dragging     = ref(false)

// ─── Estado del crop ───────────────────────────────────────────────────────
const cropCanvas = ref(null)
let   rawImage   = null       // HTMLImageElement cargado
let   scale      = 1
let   offsetX    = 0
let   offsetY    = 0
let   isDragging = false
let   lastX      = 0
let   lastY      = 0

// ─── Constantes del canvas ─────────────────────────────────────────────────
const CANVAS_SIZE = 280   // px — tamaño del canvas cuadrado visible
const OUTPUT_SIZE = 400   // px — tamaño de la imagen final exportada

// ─── Abrir selector ────────────────────────────────────────────────────────
function triggerInput() {
  fileInputRef.value?.click()
}

// ─── Validación ────────────────────────────────────────────────────────────
const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png'])
const MAX_MB  = 5 * 1024 * 1024

function validateFile(file) {
  if (!ALLOWED.has(file.type.toLowerCase())) {
    return 'Solo se permiten imágenes JPG o PNG'
  }
  if (file.size > MAX_MB) {
    return 'La imagen no puede superar los 5 MB'
  }
  return null
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const err = validateFile(file)
  if (err) { fileError.value = err; return }
  fileError.value = ''
  loadForCrop(file)
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  const err = validateFile(file)
  if (err) { fileError.value = err; return }
  fileError.value = ''
  loadForCrop(file)
}

// ─── Cargar imagen en el canvas de crop ────────────────────────────────────
function loadForCrop(file) {
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      rawImage = img
      // Inicializar scale para que la imagen llene el canvas
      const minDim = Math.min(img.naturalWidth, img.naturalHeight)
      scale   = CANVAS_SIZE / minDim
      offsetX = (CANVAS_SIZE - img.naturalWidth  * scale) / 2
      offsetY = (CANVAS_SIZE - img.naturalHeight * scale) / 2
      nextTick(() => drawCrop())
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

// ─── Dibujar el canvas de preview ──────────────────────────────────────────
function drawCrop() {
  const canvas = cropCanvas.value
  if (!canvas || !rawImage) return
  canvas.width  = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // Fondo gris para áreas vacías
  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  ctx.drawImage(
    rawImage,
    offsetX, offsetY,
    rawImage.naturalWidth  * scale,
    rawImage.naturalHeight * scale
  )

  // Oscurecer fuera del círculo
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  // Recortar círculo (modo "destination-out")
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ─── Drag sobre el canvas ───────────────────────────────────────────────────
function startDrag(e) {
  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
}
function onDragMove(e) {
  if (!isDragging) return
  offsetX += e.clientX - lastX
  offsetY += e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  drawCrop()
}
function stopDrag() { isDragging = false }

// ─── Touch ─────────────────────────────────────────────────────────────────
function onTouchStart(e) {
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
  isDragging = true
}
function onTouchMove(e) {
  if (!isDragging) return
  offsetX += e.touches[0].clientX - lastX
  offsetY += e.touches[0].clientY - lastY
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
  drawCrop()
}

// ─── Zoom con rueda ────────────────────────────────────────────────────────
function onWheel(e) {
  const delta = e.deltaY < 0 ? 0.08 : -0.08
  const newScale = Math.max(0.2, Math.min(scale + delta, 6))
  // Zoom centrado en el canvas
  const cx = CANVAS_SIZE / 2
  const cy = CANVAS_SIZE / 2
  offsetX = cx - (cx - offsetX) * (newScale / scale)
  offsetY = cy - (cy - offsetY) * (newScale / scale)
  scale = newScale
  drawCrop()
}

// ─── Exportar recorte circular como Blob ───────────────────────────────────
function exportCircularBlob() {
  return new Promise((resolve) => {
    const out = document.createElement('canvas')
    out.width  = OUTPUT_SIZE
    out.height = OUTPUT_SIZE
    const ctx  = out.getContext('2d')

    // Escalar desde CANVAS_SIZE a OUTPUT_SIZE
    const ratio = OUTPUT_SIZE / CANVAS_SIZE

    ctx.save()
    // Clip circular
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      rawImage,
      offsetX * ratio, offsetY * ratio,
      rawImage.naturalWidth  * scale * ratio,
      rawImage.naturalHeight * scale * ratio
    )
    ctx.restore()

    out.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
  })
}

// ─── Subir ─────────────────────────────────────────────────────────────────
async function uploadCropped() {
  if (uploading.value) return
  uploading.value = true
  try {
    const blob = await exportCircularBlob()
    // Crear un File desde el Blob para mantener el nombre
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    const res  = await userService.uploadAvatar(file)
    emit('avatar-updated', res.avatarUrl)
    resetState()
    emit('close')
  } catch (err) {
    fileError.value = err.message || 'Error al subir la foto'
  } finally {
    uploading.value = false
  }
}

// ─── Quitar avatar ─────────────────────────────────────────────────────────
async function confirmRemove() {
  if (uploading.value) return
  uploading.value = true
  try {
    await userService.removeAvatar()
    emit('avatar-removed')
    emit('close')
  } catch (err) {
    fileError.value = err.message || 'Error al quitar la foto'
  } finally {
    uploading.value = false
  }
}

// ─── Reset ─────────────────────────────────────────────────────────────────
function cancelCrop() {
  selectedFile.value = null
  rawImage = null
  fileError.value = ''
}

function resetState() {
  selectedFile.value = null
  rawImage = null
  fileError.value = ''
  dragging.value = false
}

function handleClose() {
  if (uploading.value) return
  resetState()
  emit('close')
}

// Reset al cerrar el modal desde afuera
watch(() => props.isOpen, (val) => {
  if (!val) resetState()
})
</script>

<style scoped>
/* ── Overlay ───────────────────────────────────────────────────────────── */
.avm-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Caja ──────────────────────────────────────────────────────────────── */
.avm-box {
  background: #ffffff;
  border-radius: 18px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

/* ── Header ────────────────────────────────────────────────────────────── */
.avm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}
.avm-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1a3a52;
  margin: 0;
  letter-spacing: -0.2px;
}
.avm-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: background 0.15s, color 0.15s;
}
.avm-close:hover:not(:disabled) { background: #f1f5f9; color: #1a3a52; }
.avm-close:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Body ──────────────────────────────────────────────────────────────── */
.avm-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.avm-body--crop { align-items: center; }

/* ── Drop zone ─────────────────────────────────────────────────────────── */
.avm-drop {
  border: 2px dashed #e2e8f0;
  border-radius: 14px;
  padding: 1.75rem 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  background: #f8fafc;
}
.avm-drop:hover,
.avm-drop--dragging {
  border-color: #1a3a52;
  background: #f0f5f8;
}

/* Avatar actual dentro del drop */
.avm-current-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255, 210, 0, 0.5);
  background: #1a3a52;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.4rem;
  flex-shrink: 0;
}
.avm-current-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avm-current-initials {
  font-size: 1.4rem;
  font-weight: 800;
  color: #FFD200;
  letter-spacing: -1px;
}

.avm-drop-text {
  font-size: 0.875rem;
  color: #334155;
  margin: 0;
  text-align: center;
}
.avm-drop-hint {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

/* ── Quitar foto ───────────────────────────────────────────────────────── */
.avm-remove-row {
  display: flex;
  justify-content: center;
}
.avm-btn-remove {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1.5px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.avm-btn-remove:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #dc2626;
}
.avm-btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Error ─────────────────────────────────────────────────────────────── */
.avm-error {
  font-size: 0.8rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin: 0;
  text-align: center;
}

/* ── Crop ──────────────────────────────────────────────────────────────── */
.avm-crop-hint {
  font-size: 0.78rem;
  color: #64748b;
  text-align: center;
  margin: 0;
}
.avm-crop-wrap {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 4px rgba(255, 210, 0, 0.45), 0 8px 24px rgba(0,0,0,0.12);
  cursor: grab;
  flex-shrink: 0;
}
.avm-crop-wrap:active { cursor: grabbing; }

.avm-crop-canvas {
  display: block;
  width: 280px;
  height: 280px;
  border-radius: 50%;
}
/* El overlay circular ya lo dibuja el canvas con compositing */

.avm-filename {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

/* ── Botones de acción ─────────────────────────────────────────────────── */
.avm-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: flex-end;
  padding-top: 0.25rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 0.25rem;
}
.avm-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.3rem;
  background: #1a3a52;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.avm-btn-primary:hover:not(:disabled) { background: #1e4d6b; }
.avm-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.avm-btn-secondary {
  padding: 0.6rem 1.1rem;
  background: white;
  color: #374151;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.avm-btn-secondary:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.avm-btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Spinner ───────────────────────────────────────────────────────────── */
.avm-spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transición del modal ──────────────────────────────────────────────── */
.avatar-modal-enter-active,
.avatar-modal-leave-active { transition: opacity 0.2s ease; }
.avatar-modal-enter-active .avm-box,
.avatar-modal-leave-active .avm-box { transition: transform 0.2s ease, opacity 0.2s ease; }
.avatar-modal-enter-from,
.avatar-modal-leave-to { opacity: 0; }
.avatar-modal-enter-from .avm-box { transform: scale(0.94) translateY(8px); }
.avatar-modal-leave-to  .avm-box { transform: scale(0.94) translateY(8px); }
</style>