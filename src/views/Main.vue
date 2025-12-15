<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import emailjs from "@emailjs/browser";
import router from "@/router";
import {printPdf} from "@/services/printPdfService.ts";


export interface Term {
  term: string;
  description: string;
  year: number;
  isIn: boolean;
  links: string[];
  pictures: string[];
}

interface Brainrot {
  terms?: Term[];
}

const brainrot = ref<Brainrot>({});
const filteredBrainrot = ref<Array<Term> | undefined>([]);
const searchInput = ref("")

onMounted(async () => {
  const res = await fetch("/brainrot.json");
  brainrot.value = await res.json();
  filteredBrainrot.value = brainrot.value.terms;
  sortFilteredBrainrot();
});

const goToDetail = (term: Term) => {
  router.push(`/skibidi/${term.term}`);
};

/* --- MODAL STATES --- */
const modalOpen = ref(false);
const word = ref("");
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

  if (!word.value.trim()) {
    errorMsg.value = "Bitte gib ein Wort ein!";
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
          "template_570h0y9",
          {
            word: word.value,
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
          word.value = "";
          name.value = "";
          successMsg.value = "";
        }, 2500);
      })
      .catch(() => {
        loading.value = false;
        errorMsg.value = " Fehler beim Senden – probier's nochmal!";
      });
}

function sortFilteredBrainrot() {
  if (!filteredBrainrot.value) return;

  filteredBrainrot.value.sort((a, b) => {
    if (a.isIn !== b.isIn) {
      return Number(b.isIn) - Number(a.isIn);
    }
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.term.localeCompare(b.term, "de", {sensitivity: "base"});
  });
}


watch(searchInput, (value) => {
  filteredBrainrot.value = brainrot.value.terms?.filter(s => s.term.toLowerCase().includes(value.toLowerCase()) || s.description.toLowerCase().includes(value.toLowerCase()) || s.year.toString().includes(value.toLowerCase()));
  sortFilteredBrainrot();
})

const pdfIsStyled = ref(false);

function downloadPdf() {
  if (filteredBrainrot.value && filteredBrainrot.value?.length > 0) {
    printPdf(filteredBrainrot.value, pdfIsStyled.value)
  }
}


</script>

<template>
  <div class="wrapper">
    <h1 class="title">
      🚩 BRAINROT DICTIONARY 🚩
      <img src="/marx.png" class="marx-spinner" alt="karl marx"/>
    </h1>

    <!-- BUTTONS GROUP -->
    <div class="buttons-group">
      <button class="goofy-btn" @click="modalOpen = true">
        Wort vorschlagen
      </button>
      <div>
        <button class="goofy-btn" @click="downloadPdf">
          Pdf herunterladen
        </button>
        <div class="tooltip-container">
          <input
              type="checkbox"
              id="styledPdf"
              v-model="pdfIsStyled"
              class="styled-checkbox"
          >
          <span class="tooltip-text">Mit Styling?</span>
        </div>

      </div>
    </div>

    <!-- Search Field -->
    <div>
      <label> Begriff Suchen
        <input type="text" class="search-input" v-model="searchInput">
      </label>
    </div>


    <!-- MODAL -->
    <div v-if="modalOpen" class="modal-backdrop" @click.self="modalOpen = false">
      <div class="modal">
        <h2 class="modal-title"> Vorschlag einreichen</h2>

        <label>Wort</label>
        <input v-model="word" type="text" class="modal-input"/>

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

    <!-- TERM LIST -->
    <div class="term-list" v-if="brainrot.terms">
      <div
          class="term-card"
          v-for="(term, i) in filteredBrainrot"
          :key="term.term"
          :style="{ '--i': i }"
          @click="goToDetail(term)"
      >
        <div class="term-header">
          <img
              :alt="term.term"
              v-if="term.pictures[0]"
              :src="term.pictures[0]"
              class="mini-spin"
          />
          <div class="term-name">{{ term.term }}</div>
        </div>

        <div class="term-desc">{{ term.description }}</div>
        <div class="term-meta"> Jahr: {{ term.year }}</div>
        <div class="term-meta"> Noch in: {{ term.isIn ? "Ja" : "Nein" }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- ANIMATIONS --- */
@keyframes pulse {
  0% {
    transform: rotate(-2deg) scale(1);
  }
  50% {
    transform: rotate(2deg) scale(1.08);
  }
  100% {
    transform: rotate(-2deg) scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: rotate(-1deg);
  }
  50% {
    transform: rotate(1.5deg);
  }
  100% {
    transform: rotate(-1deg);
  }
}

/* --- GENERAL LAYOUT --- */
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 3.5rem;
  color: #ff0000;
  text-shadow: 5px 5px 0 #000;
  padding-bottom: 15px;
  margin-bottom: 30px;
  animation: pulse 2.6s infinite ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marx-spinner {
  width: 100px;
  animation: spin 4s linear infinite;
  margin-top: 10px;
  filter: drop-shadow(0 0 10px red);
}

/* --- BUTTONS GROUP --- */
.buttons-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 600px;
}

/* --- GOOFY BUTTON --- */
.goofy-btn {
  background: #ff0000;
  color: white;
  padding: 12px 25px;
  border: 3px solid black;
  font-size: 1.3rem;
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
  padding: 8px 15px;
  font-size: 1.1rem;
}

.goofy-btn.cancel {
  background: #660000;
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

.goofy-btn.small {
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 15px);
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
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

.search-input {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  background: #550000;
  border: 2px solid red;
  color: white;
  border-radius: 5px;
  margin-bottom: 10px;
}

/* --- TERM CARDS --- */
.term-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 600px;
}

.term-card {
  background: linear-gradient(135deg, #2a0000, #4d0000);
  border: 4px solid #ff0000;
  padding: 25px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 15px #ff0000aa;
  animation: wiggle 2s infinite ease-in-out;
  transform: rotate(calc(var(--i) * 1.3deg));
  transition: 0.2s;
}

.term-card:hover {
  transform: scale(1.05) rotate(0deg);
  box-shadow: 0 0 25px #ff5555;
  background: #660000;
}

.term-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mini-spin {
  width: 40px;
  animation: spin 2s linear infinite;
  filter: drop-shadow(0 0 8px red);
}

.term-name {
  font-size: 2rem;
  color: #ff4d4d;
  text-transform: uppercase;
}

.term-desc {
  font-size: 1.1rem;
  margin: 12px 0;
  font-family: "Arial Black", sans-serif;
  color: #ffdede;
}

.term-meta {
  font-size: 1rem;
  font-family: monospace;
  color: #ff9999;
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

/* --- TOOLTIP CHECKBOX --- */
.tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;

}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  background-color: #ff0000;
  color: white;
  text-align: center;
  padding: 5px 10px;
  border-radius: 5px;
  border: 2px solid black;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) skew(-3deg);
  white-space: nowrap;
  transition: opacity 0.3s, visibility 0.3s;
  font-family: "Impact", sans-serif;
  font-size: 1rem;
  box-shadow: 3px 3px 0 black;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #ff0000 transparent transparent transparent;
}

/* Custom checkbox styling */
.styled-checkbox {
  cursor: pointer;

}


</style>
