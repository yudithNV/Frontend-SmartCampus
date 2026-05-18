<template>
  <!-- ── Botón flotante ─────────────────────────────────────────────── -->
  <button
    class="chatbot-fab"
    :class="{ 'chatbot-fab--open': isOpen }"
    @click="toggleChat"
    title="Asistente UCB"
    aria-label="Abrir asistente virtual"
  >
    <!-- Ícono chat cuando está cerrado -->
    <svg v-if="!isOpen" width="26" height="26" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
    <!-- Ícono X cuando está abierto -->
    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <!-- Badge de mensajes no leídos -->
    <span v-if="unreadCount > 0 && !isOpen" class="chatbot-badge">{{ unreadCount }}</span>
  </button>

  <!-- ── Ventana de chat ────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="chat-slide">
      <div v-if="isOpen" class="chatbot-window" role="dialog" aria-label="Asistente virtual UCB">

        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header__info">
            <div class="chatbot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="#1a3a52" stroke-width="2" stroke-linecap="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <span class="chatbot-header__name">Asistente UCB</span>
              <span class="chatbot-header__status">
                <span class="status-dot"></span>En línea
              </span>
            </div>
          </div>
          <button class="chatbot-clear" @click="clearHistory" title="Limpiar conversación">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>

        <!-- Cuerpo de mensajes -->
        <div class="chatbot-messages" ref="messagesContainer">
          <!-- Mensaje de bienvenida -->
          <div class="chatbot-message chatbot-message--bot">
            <div class="msg-bubble">
              👋 ¡Hola! Soy el asistente virtual de UCB SmartCampus. Puedo ayudarte con
              inscripciones, horarios, servicios universitarios y más. ¿En qué puedo ayudarte?
            </div>
            <div class="msg-suggestions">
              <button
                v-for="s in quickSuggestions"
                :key="s"
                class="suggestion-chip"
                @click="sendQuick(s)"
              >{{ s }}</button>
            </div>
          </div>

          <!-- Historial de la sesión -->
          <template v-for="msg in messages" :key="msg.id">
            <!-- Mensaje del usuario -->
            <div class="chatbot-message chatbot-message--user">
              <div class="msg-bubble">{{ msg.question }}</div>
            </div>

            <!-- Respuesta del bot -->
            <div class="chatbot-message chatbot-message--bot">
              <div class="msg-bubble" :class="{ 'msg-bubble--escalated': msg.escalated }">
                <!-- Ícono de escalamiento -->
                <span v-if="msg.escalated" class="escalation-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07
                             A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67
                             A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81
                             a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l1.27-1.27
                             a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15z"/>
                  </svg>
                  Escalado a soporte
                </span>
                {{ msg.answer }}

                <!-- Botón de confirmación de escalamiento -->
                <div v-if="msg.escalated && !msg.escalationConfirmed" class="escalation-actions">
                  <p class="escalation-prompt">¿Quieres que registremos tu consulta para soporte humano?</p>
                  <div class="escalation-btns">
                    <button class="btn-escalate-yes" @click="confirmEscalation(msg)">
                      Sí, quiero soporte
                    </button>
                    <button class="btn-escalate-no" @click="msg.escalationConfirmed = true">
                      No, gracias
                    </button>
                  </div>
                </div>
                <div v-if="msg.escalated && msg.escalationConfirmed" class="escalation-confirmed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Consulta registrada para soporte
                </div>
              </div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </template>

          <!-- Indicador de escritura -->
          <div v-if="loading" class="chatbot-message chatbot-message--bot">
            <div class="msg-bubble msg-bubble--typing">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chatbot-input-area">
          <textarea
            ref="inputRef"
            v-model="inputText"
            class="chatbot-input"
            placeholder="Escribe tu pregunta aquí..."
            rows="1"
            :disabled="loading"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          />
          <button
            class="chatbot-send"
            :disabled="!inputText.trim() || loading"
            @click="sendMessage"
            title="Enviar (Enter)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div class="chatbot-footer">
          Powered by UCB SmartCampus · <kbd>Enter</kbd> para enviar
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { chatbotService } from '../../services/api.js'

// ── Estado ────────────────────────────────────────────────────────────────────
const isOpen      = ref(false)
const inputText   = ref('')
const loading     = ref(false)
const messages    = ref([])   // Historial de la sesión (en memoria, no persiste al recargar)
const unreadCount = ref(0)
const messagesContainer = ref(null)
const inputRef    = ref(null)
let   msgCounter  = 0

// Chips de sugerencia rápida para el mensaje de bienvenida
const quickSuggestions = [
  '¿Cuándo son las inscripciones?',
  '¿Cuáles son los horarios de la biblioteca?',
  '¿Cómo obtengo mi certificado de notas?',
  '¿Dónde está Bienestar Estudiantil?'
]

// ── Abrir / cerrar ────────────────────────────────────────────────────────────
function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    nextTick(() => {
      inputRef.value?.focus()
      scrollToBottom()
    })
  }
}

// ── Enviar mensaje principal ──────────────────────────────────────────────────
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  inputText.value = ''
  resetInputHeight()
  loading.value = true

  // Agregar mensaje del usuario al historial local
  const msgId = ++msgCounter
  messages.value.push({
    id: msgId,
    question: text,
    answer: '',
    escalated: false,
    escalationConfirmed: false,
    time: formatTime()
  })

  await nextTick()
  scrollToBottom()

  try {
    const response = await chatbotService.ask(text)
    const last = messages.value.find(m => m.id === msgId)
    if (last) {
      last.answer  = response.answer
      last.escalated = response.escalated
      last.time    = formatTime()
    }

    // Si el chat está cerrado, incrementar badge
    if (!isOpen.value) unreadCount.value++

  } catch (err) {
    const last = messages.value.find(m => m.id === msgId)
    if (last) {
      last.answer = 'Ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.'
      last.time = formatTime()
    }
    console.error('ChatBot error:', err)
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// ── Enviar desde sugerencia rápida ───────────────────────────────────────────
async function sendQuick(text) {
  inputText.value = text
  await sendMessage()
}

// ── Confirmar escalamiento ───────────────────────────────────────────────────
/**
 * Cuando el usuario acepta el escalamiento, marcamos el mensaje como confirmado.
 * El registro ya está guardado en chatbot_history con escalated=true desde el backend.
 * Solo actualizamos la UI para mostrar la confirmación.
 */
function confirmEscalation(msg) {
  msg.escalationConfirmed = true
}

// ── Limpiar historial de sesión ───────────────────────────────────────────────
function clearHistory() {
  messages.value = []
  msgCounter = 0
}

// ── Scroll automático ─────────────────────────────────────────────────────────
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// ── Auto-resize del textarea ──────────────────────────────────────────────────
function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function resetInputHeight() {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
}

// Scroll automático cuando llega respuesta
watch(() => messages.value.length, () => {
  nextTick(scrollToBottom)
})
</script>

<style scoped>
/* ── FAB (botón flotante) ─────────────────────────────────────────────────── */
.chatbot-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #1a3a52;
  color: #FFD200;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(26, 58, 82, 0.35);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 3000;
}

.chatbot-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(26, 58, 82, 0.45);
}

.chatbot-fab--open {
  background: #FFD200;
  color: #1a3a52;
}

.chatbot-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #f8fafc;
}

/* ── Ventana de chat ──────────────────────────────────────────────────────── */
.chatbot-window {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 380px;
  max-width: calc(100vw - 2rem);
  height: 560px;
  max-height: calc(100vh - 8rem);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(26, 58, 82, 0.2), 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2999;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.chatbot-header {
  background: #1a3a52;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chatbot-header__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chatbot-avatar {
  width: 38px;
  height: 38px;
  background: #FFD200;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chatbot-header__name {
  display: block;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.2;
}

.chatbot-header__status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.78rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chatbot-clear {
  background: rgba(255,255,255,0.1);
  border: none;
  color: rgba(255,255,255,0.7);
  border-radius: 8px;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.chatbot-clear:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

/* ── Mensajes ─────────────────────────────────────────────────────────────── */
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scroll-behavior: smooth;
  background: #f8fafc;
}

.chatbot-messages::-webkit-scrollbar { width: 4px; }
.chatbot-messages::-webkit-scrollbar-track { background: transparent; }
.chatbot-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

.chatbot-message {
  display: flex;
  flex-direction: column;
  max-width: 88%;
  gap: 0.25rem;
}

.chatbot-message--user {
  align-self: flex-end;
  align-items: flex-end;
}

.chatbot-message--bot {
  align-self: flex-start;
  align-items: flex-start;
}

/* Burbujas */
.msg-bubble {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.55;
  word-break: break-word;
}

.chatbot-message--user .msg-bubble {
  background: #1a3a52;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chatbot-message--bot .msg-bubble {
  background: #ffffff;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* Burbuja de escalamiento */
.msg-bubble--escalated {
  border: 1px solid #fbbf24;
  background: #fffbeb;
}

.escalation-icon {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Acciones de escalamiento */
.escalation-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #fde68a;
}

.escalation-prompt {
  font-size: 0.82rem;
  color: #92400e;
  margin: 0 0 0.6rem 0;
  font-weight: 500;
}

.escalation-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-escalate-yes {
  padding: 0.45rem 0.9rem;
  background: #1a3a52;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-escalate-yes:hover { background: #0f2438; }

.btn-escalate-no {
  padding: 0.45rem 0.9rem;
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-escalate-no:hover { background: #f1f5f9; }

.escalation-confirmed {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #166534;
}

.msg-time {
  font-size: 0.72rem;
  color: #94a3b8;
  padding: 0 0.25rem;
}

/* Sugerencias rápidas */
.msg-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.suggestion-chip {
  padding: 0.35rem 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.78rem;
  color: #1a3a52;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.suggestion-chip:hover {
  background: #FFD200;
  border-color: #FFD200;
  color: #1a3a52;
}

/* Indicador "escribiendo..." */
.msg-bubble--typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.85rem 1.1rem;
  min-width: 60px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}

/* ── Input ────────────────────────────────────────────────────────────────── */
.chatbot-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
}

.chatbot-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
  background: #f8fafc;
  color: #1e293b;
}

.chatbot-input:focus {
  border-color: #1a3a52;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(26, 58, 82, 0.08);
}

.chatbot-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chatbot-send {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #FFD200;
  color: #1a3a52;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.chatbot-send:hover:not(:disabled) {
  background: #FFC500;
  transform: translateY(-1px);
}

.chatbot-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.chatbot-footer {
  padding: 0.4rem 1rem;
  text-align: center;
  font-size: 0.72rem;
  color: #94a3b8;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.chatbot-footer kbd {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  padding: 0 4px;
  font-size: 0.68rem;
}

/* ── Transición de apertura ──────────────────────────────────────────────── */
.chat-slide-enter-active {
  animation: chatOpen 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-slide-leave-active {
  animation: chatClose 0.2s ease-in forwards;
}

@keyframes chatOpen {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes chatClose {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(20px) scale(0.95); }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .chatbot-window {
    bottom: 5.5rem;
    right: 0.75rem;
    left: 0.75rem;
    width: auto;
    max-width: none;
  }

  .chatbot-fab {
    bottom: 1.25rem;
    right: 1.25rem;
  }
}
</style>