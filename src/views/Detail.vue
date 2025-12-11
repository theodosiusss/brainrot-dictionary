<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Term } from "@/views/Main.vue";
import router from "@/router";

const props = defineProps({
  term: String,
});

const term = ref<Term | null>(null);

onMounted(async () => {
  const res = await fetch("/brainrot.json");
  const data = await res.json();
  term.value = data.terms?.find((t: Term) => t.term === props.term);
});

// random position helper
const randomStyle = () => {
  const top = Math.random() * 70; // 10–60vh
  const left = Math.random() * 90; // 10–60vw
  const rotate = Math.random() * 30 - 10;

  return {
    top: `${top}vh`,
    left: `${left}vw`,
    transform: `rotate(${rotate}deg)`
  };
};
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
  padding-bottom: 200px;
  max-height: 70vh;
}

/* TITLE */
.detail-title {
  margin-top: 20px;
  font-size: 3.5rem;
  color: #ff0000;
  text-shadow: 5px 5px 0 black;
  animation: wiggle 2.6s infinite ease-in-out;
  display: flex;
  align-items: center;
  gap: 20px;
}

/* CARD */
.detail-card {
  background: linear-gradient(135deg, #2a0000, #4d0000);
  border: 4px solid #ff0000;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 0 15px #ff0000aa;
  animation: wiggle 2s infinite ease-in-out;
  max-width: 600px;
  margin-top: 20px;
}

.detail-desc {
  font-size: 1.4rem;
  color: #ffdede;
  margin-bottom: 15px;
  font-family: "Arial Black";
}

.detail-meta {
  color: #ff9999;
  font-family: monospace;
  margin-bottom: 5px;
}

/* LINKS */
.link-section h3 {
  color: #ff4d4d;
  margin-top: 15px;
  font-size: 1.5rem;
}

.link-section a {
  color: #ff9999;
  text-decoration: underline;
}

/* FLOATING SPINNING IMAGES */
.floating-img {
  position: absolute;
  width: 140px;
  animation: spin 3s linear infinite;
  filter: drop-shadow(0 0 10px red);
  z-index: 200;
  pointer-events: none;
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
</style>
