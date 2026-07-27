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
            Маша купила билеты на концерт за 900 рублей. <br >Делим на 3
            участника потому что все идут: Маша, Саша, Петя = 300 рублей на
            человека
          </li>
          <li class="mb-1">
            Саша заплатила 500 рублей за хот доги. <br >Делим на 2 участника
            потому что Саша и Маша едят хот доги, а Петя нет: Маша, Саша = 250
            рубля на человека
          </li>
          <li class="mb-1">
            Петя заплатил 300 рублей за газировку. <br >Делим на 3 участника
            потому что ее пьют все: Маша, Саша, Петя = 100 рубля на человека
          </li>
        </ul>
        <p class="mb-4 font-weight-bold">Считаем итог по каждому:</p>
        <ul class="mb-4">
          <li class="mb-1">
            Маша заплатила 900, а её доля — 650. Ей должны вернуть 250
          </li>
          <li class="mb-1">Саша заплатила 500, а её доля — 650. Она должна 150</li>
          <li class="mb-1">Петя заплатил 300, а его доля — 400. Он должен 100</li>
        </ul>
        <p class="mb-4 font-weight-bold">Результат — всего два перевода:</p>
        <ul class="mb-4">
          <li class="mb-2">Саша → Маше 150 рублей</li>
          <li class="mb-2">Петя → Маше 100 рублей</li>
        </ul>
        <p class="text-body-2">
          Калькулятор сводит долги так, чтобы переводов было как можно меньше и
          никто не пересылал деньги через третьего.
        </p>
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
const model = defineModel<boolean>();
</script>

<style lang="scss" scoped>
ul {
  padding-left: 20px;
  list-style: disc;
}
</style>
