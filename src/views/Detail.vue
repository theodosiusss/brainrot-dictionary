<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Term } from "@/views/Main.vue";
import router from "@/router";
import emailjs from "@emailjs/browser";

const props = defineProps({
  term: String,
});

const term = ref<Term | null>(null);

onMounted(async () => {
  const res = await fetch("/brainrot.json");
  const data = await res.json();
  term.value = data.terms?.find((t: Term) => t.term === props.term);
  console.log(term.value);
});

// random position helper - UPDATED for better mobile
const randomStyle = () => {
  // Use viewport units for responsiveness
  const top = Math.random() * 70; // 10–60vh
  const left = Math.random() * 90; // 10–60vw
  const rotate = Math.random() * 30 - 10;

  return {
    top: `${top}vh`,
    left: `${left}vw`,
    transform: `rotate(${rotate}deg)`
  };
};

/*--- MODAL STATES --- */
const modalOpen = ref(false);
const change = ref("");
const name = ref("");

/* --- THROTTLING --- */
const lastSend = ref(0);
const cooldownMs = 10000; // 10 Sekunden

const loading = ref(false);
const successMsg = ref("");
const errorMsg = ref("");

function sendEmail() {
  const now = Date.now();
  const date = new Date(now);
  successMsg.value = "";
  errorMsg.value = "";

  if (now - lastSend.value < cooldownMs) {
    const diff = Math.ceil((cooldownMs - (now - lastSend.value)) / 1000);
    errorMsg.value = `Bitte warte noch ${diff} Sekunden!`;
    return;
  }

  if (!change.value.trim()) {
    errorMsg.value = "Bitte gib eine Abänderung ein!";
    return;
  }

  if (!name.value.trim()) {
    errorMsg.value = "Bitte gib deinen Namen ein!";
    return;
  }

  lastSend.value = now;
  loading.value = true;


  emailjs
      .send(
          "service_k5qy8k8",
          "template_w1jnlkp",
          {
            change: change.value,
            word: term.value?.term,
            name: name.value,
            time: date.toLocaleString(),
          },
          "iIrA1FOfcEuJFVUTo"
      )
      .then(() => {
        loading.value = false;
        successMsg.value = " Erfolgreich abgeschickt!";

        // Nach kurzer Zeit Modal schließen
        setTimeout(() => {
          modalOpen.value = false;
          change.value = "";
          name.value = "";
          successMsg.value = "";
        }, 2500);
      })
      .catch(() => {
        loading.value = false;
        errorMsg.value = " Fehler beim Senden – probier's nochmal!";
      });
}
</script>

<template>
  <div class="detail-wrapper" v-if="term">
    <button class="goofy-btn small" @click="router.push('/')">⬅ zurück</button>

    <h1 class="detail-title">
      {{ term.term }}
    </h1>

    <div class="detail-card">
      <div class="detail-desc">{{ term.description }}</div>
      <div class="detail-meta">📅 Jahr: {{ term.year }}</div>
      <div class="detail-meta">🔥 Noch in: {{ term.isIn ? "Ja" : "Nein" }}</div>

      <div v-if="term.links.length > 0" class="link-section">
        <h3>🔗 Links</h3>
        <ul>
          <li v-for="link in term.links" :key="link">
            <a target="_blank" :href="link">{{ link }}</a>
          </li>
        </ul>
      </div>
    </div>

    <button class="goofy-btn" @click="modalOpen = true">
      Änderung Anfragen
    </button>



    <!-- Chaotic spinning images -->
    <img
        v-for="picture in term.pictures"
        :key="picture"
        :src="picture"
        class="floating-img"
        :style="randomStyle()"
        :alt="term.term +'picture'"
    />
  </div>
  <!-- MODAL -->
  <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
    <div class="modal">
      <h2 class="modal-title"> Vorschlag einreichen</h2>

      <label>Abänderungsvorschlag</label>
      <input v-model="change" type="text" class="modal-input"/>

      <label>Dein Name</label>
      <input v-model="name" type="text" class="modal-input"/>


      <div v-if="successMsg" class="success-box">{{ successMsg }}</div>
      <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

      <div class="modal-buttons">
        <button class="goofy-btn small" @click="sendEmail" :disabled="loading">
          <span v-if="!loading">Abschicken</span>
          <span v-else>⏳ Senden...</span>
        </button>
        <button class="goofy-btn small cancel" @click="modalOpen = false">
          Schließen
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ANIMATIONS */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wiggle {
  0% { transform: rotate(-1deg); }
  50% { transform: rotate(1.5deg); }
  100% { transform: rotate(-1deg); }
}

/* PAGE WRAPPER */
.detail-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 90vh;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* BACK BUTTON */
.goofy-btn.small {
  align-self: flex-start;
  z-index: 100;
  position: relative;
}

/* TITLE */
.detail-title {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: clamp(2rem, 8vw, 3.5rem);
  color: #ff0000;
  text-shadow: 5px 5px 0 black;
  animation: wiggle 2.6s infinite ease-in-out;
  text-align: center;
  padding: 0 20px;
  word-break: break-word;
  line-height: 1.2;
}

/* CARD */
.detail-card {
  background: linear-gradient(135deg, #2a0000, #4d0000);
  border: 4px solid #ff0000;
  padding: clamp(15px, 4vw, 25px);
  border-radius: 10px;
  box-shadow: 0 0 15px #ff0000aa;
  animation: wiggle 2s infinite ease-in-out;
  max-width: min(600px, 90vw);
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

.detail-desc {
  font-size: clamp(1rem, 4vw, 1.4rem);
  color: #ffdede;
  margin-bottom: 15px;
  font-family: "Arial Black", Arial, sans-serif;
  line-height: 1.4;
  word-break: break-word;
}

.detail-meta {
  color: #ff9999;
  font-family: monospace;
  margin-bottom: 5px;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

/* LINKS */
.link-section h3 {
  color: #ff4d4d;
  margin-top: 15px;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

.link-section a {
  color: #ff9999;
  text-decoration: underline;
  word-break: break-all;
  font-size: clamp(0.9rem, 3vw, 1rem);
}

.link-section ul {
  padding-left: 20px;
  margin: 10px 0;
}

/* FLOATING SPINNING IMAGES */
.floating-img {
  position: absolute;
  width: clamp(80px, 20vw, 140px);
  max-width: 140px;
  animation: spin 3s linear infinite;
  filter: drop-shadow(0 0 10px red);
  z-index: 200;
  pointer-events: none;
}

/* --- GOOFY BUTTON --- */
.goofy-btn {
  background: #ff0000;
  color: white;
  padding: clamp(8px, 2vw, 12px) clamp(15px, 4vw, 25px);
  border: 3px solid black;
  font-size: clamp(1rem, 3vw, 1.3rem);
  font-family: "Impact", sans-serif;
  cursor: pointer;
  transform: skew(-3deg);
  box-shadow: 4px 4px 0 black;
  transition: 0.15s;
}

.goofy-btn:hover {
  transform: scale(1.05) skew(0deg);
  background: #ff3b3b;
}

.goofy-btn.small {
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 15px);
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
}
.goofy-btn.cancel {
  background: #660000;
}

/* MEDIA QUERIES */
@media (max-width: 768px) {
  .detail-wrapper {
    padding-bottom: 150px;
  }

  .detail-title {
    margin-top: 5px;
    text-shadow: 3px 3px 0 black;
  }

  .detail-card {
    margin-top: 5px;
  }
}

@media (max-width: 480px) {
  .detail-wrapper {
    padding: 15px;
    padding-bottom: 120px;
  }

  .floating-img {
    width: clamp(60px, 25vw, 100px);
  }

}

/* Landscape mode */
@media (max-height: 600px) and (orientation: landscape) {
  .detail-wrapper {
    padding-bottom: 100px;
  }

  .detail-title {
    margin-top: 5px;
    font-size: clamp(1.8rem, 6vw, 2.5rem);
  }

  .floating-img {
    width: clamp(50px, 15vh, 100px);
  }
}
/* --- MODAL --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: #000000cc;
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* optional, aber sauber */

}

.modal {
  background: #330000;
  border: 3px solid red;
  padding: 25px;
  border-radius: 10px;
  width: 350px;
  animation: wiggle 0.4s ease-in-out;
  box-shadow: 0 0 20px red;

}

.modal-title {
  text-align: center;
  color: #ff4d4d;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

label {
  color: #ffaaaa;
  font-size: 0.95rem;
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
}

.modal-input {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  background: #550000;
  border: 2px solid red;
  color: white;
  border-radius: 5px;
  margin-bottom: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
.success-box {
  background: #00cc44;
  border: 3px solid #003300;
  color: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.2rem;
  animation: wiggle 0.3s ease-in-out;
  box-shadow: 0 0 10px #00ff66;
}

.error-box {
  background: #cc0000;
  border: 3px solid #660000;
  color: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 1.2rem;
  animation: wiggle 0.3s ease-in-out;
  box-shadow: 0 0 10px #ff3333;
}

</style>