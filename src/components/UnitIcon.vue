<script setup>
const props = defineProps({
  type: { type: String, default: "UNKNOWN" },
});

const t = (props.type || "UNKNOWN").toUpperCase();
</script>

<template>
  <svg viewBox="0 0 24 24" class="unit-type-icon" aria-hidden="true">
    <!-- BATTLEMECH -->
    <g v-if="t === 'BATTLEMECH'" fill="currentColor">
      <rect x="10" y="2" width="4" height="3" />
      <rect x="8" y="5" width="8" height="7" />
      <rect x="4" y="5" width="3" height="8" />
      <rect x="17" y="5" width="3" height="8" />
      <rect x="8" y="12" width="3" height="10" />
      <rect x="13" y="12" width="3" height="10" />
    </g>

    <!-- PROTOMECH -->
    <g v-else-if="t === 'PROTOMECH'" fill="currentColor">
      <rect x="10" y="3" width="4" height="3" />
      <rect x="9" y="6" width="6" height="6" />
      <rect x="6" y="7" width="2" height="5" />
      <rect x="16" y="7" width="2" height="5" />
      <rect x="9" y="12" width="2" height="8" />
      <rect x="13" y="12" width="2" height="8" />
    </g>

    <!-- INDUSTRIALMECH -->
    <g v-else-if="t === 'INDUSTRIALMECH'" fill="currentColor">
      <rect x="10" y="2" width="4" height="3" />
      <rect x="8" y="5" width="8" height="7" />
      <rect x="4" y="5" width="3" height="4" />
      <rect x="2" y="2" width="2" height="7" />
      <rect x="2" y="2" width="5" height="2" />
      <rect x="17" y="5" width="3" height="8" />
      <rect x="8" y="12" width="3" height="10" />
      <rect x="13" y="12" width="3" height="10" />
    </g>

    <!-- COMBAT-VEHICLE -->
    <g v-else-if="t === 'COMBAT-VEHICLE'" fill="currentColor">
      <rect x="2" y="14" width="20" height="4" rx="1" />
      <rect x="4" y="10" width="16" height="5" />
      <rect x="9" y="6" width="6" height="5" />
      <rect x="15" y="7" width="6" height="2" />
    </g>

    <!-- SUPPORT-VEHICLE -->
    <g v-else-if="t === 'SUPPORT-VEHICLE'" fill="currentColor">
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="18" r="3" />
      <rect x="3" y="10" width="18" height="7" rx="1" />
      <rect x="16" y="7" width="5" height="5" />
    </g>

    <!-- ADVANCED-SUPPORT -->
    <g v-else-if="t === 'ADVANCED-SUPPORT'" fill="currentColor">
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="18" r="3" />
      <rect x="3" y="10" width="18" height="7" rx="1" />
      <rect x="16" y="7" width="5" height="5" />
      <rect x="5" y="4" width="1" height="6" />
      <rect x="3" y="4" width="5" height="1" />
    </g>

    <!-- AEROSPACE -->
    <g v-else-if="t === 'AEROSPACE'" fill="currentColor">
      <polygon points="12,2 14,10 12,18 10,10" />
      <polygon points="10,10 2,14 2,16 10,12" />
      <polygon points="14,10 22,14 22,16 14,12" />
      <rect x="11" y="4" width="2" height="3" />
    </g>

    <!-- ADVANCED-AEROSPACE -->
    <g v-else-if="t === 'ADVANCED-AEROSPACE'" fill="currentColor">
      <polygon points="12,1 15,10 12,20 9,10" />
      <polygon points="9,10 1,12 1,14 9,12" />
      <polygon points="15,10 23,12 23,14 15,12" />
      <rect x="10" y="18" width="4" height="3" />
    </g>

    <!-- INFANTRY -->
    <g v-else-if="t === 'INFANTRY'" fill="currentColor">
      <circle cx="12" cy="5" r="2.5" />
      <rect x="9.5" y="8" width="5" height="7" />
      <rect x="9.5" y="15" width="2" height="7" />
      <rect x="12.5" y="15" width="2" height="7" />
      <rect x="7" y="10" width="5" height="1.5" />
    </g>

    <!-- BUILDING -->
    <g v-else-if="t === 'BUILDING'" fill="currentColor">
      <polygon points="12,2 22,9 2,9" />
      <rect x="4" y="9" width="16" height="13" />
      <rect
        x="10"
        y="16"
        width="4"
        height="6"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      />
    </g>

    <!-- UNKNOWN / fallback -->
    <g v-else fill="currentColor">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <circle cx="12" cy="9" r="1.5" />
      <rect x="10.5" y="12" width="3" height="5" />
    </g>
  </svg>
</template>

<style scoped>
.unit-type-icon {
  width: 22px;
  height: 22px;
  display: block;
}
</style>
