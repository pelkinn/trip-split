<template>
  <VDialog v-model="model" max-width="600">
    <VCard class="pa-6">
      <div class="mb-8">
        <p class="text-h6 mb-8 font-weight-bold">Пример расчета</p>
        <p class="mb-4 font-weight-bold">Участники:</p>
        <ul class="mb-4">
          <li class="mb-1">Маша</li>
          <li class="mb-1">Саша</li>
          <li class="mb-1">Петя</li>
        </ul>
        <p class="mb-4 font-weight-bold">Расходы:</p>
        <ul class="mb-4">
          <li class="mb-1">
            Маша купила билеты на концерт за 1000 рублей. <br />Делим на 3
            участника потому что все идут: Маша, Саша, Петя = 333.33 рубля на
            человека
          </li>
          <li class="mb-1">
            Саша заплатила 500 рублей за хот доги. <br />Делим на 2 участника
            потому что Саша и Маша едят хот доги, а Петя нет: Маша, Саша = 250
            рубля на человека
          </li>
          <li class="mb-1">
            Петя заплатил 300 рублей за газировку. <br />Делим на 3 участника
            потому что ее пьют все: Маша, Саша, Петя = 100 рубля на человека
          </li>
        </ul>
        <p class="mb-4 font-weight-bold">Результат:</p>
        <ul class="mb-4">
          <li class="mb-2">
            Саша должен Маше 333.33 рубля, а Маша должна Саше 250 рублей, значит
            Саша → Маше 83.33 рубля
          </li>
          <li class="mb-2">Саша → Пете 100 рублей</li>
          <li class="mb-2">
            Петя должен Маше 333.33 рубля, а Маша должна Пете 100 рублей, значит
            Петя → Маше 233.33 рубля
          </li>
        </ul>
      </div>
      <div class="d-flex flex-column flex-sm-row justify-end">
        <VBtn variant="outlined" color="black" @click="model = false"
          >Закрыть</VBtn
        >
      </div>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
import { mdiArrowRightThin } from "@mdi/js";
import type { Result } from "~/type/common";

const model = defineModel<boolean>();
</script>

<style lang="scss" scoped>
ul {
  padding-left: 20px;
  list-style: disc;
}
</style>
