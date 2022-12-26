<template>
  <el-select
    @change="changeChannel"
    :value="value"
    placeholder="请选择"
    clearable
  >
    <el-option
      v-for="item in channelOptions"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'MyChannel',
  props: ['value'],
  data () {
    return {
      // channelId: null,
      channelOptions: []
    }
  },
  created () {
    this.getChannelOptions()
  },
  methods: {
    async getChannelOptions () {
      const res = await this.$http.get('/v1_0/channels')
      this.channelOptions = res.data.data.channels
    },
    changeChannel (changedChannelId) {
      this.$emit('input', changedChannelId)
    }
  }
}
</script>

<style scoped lang='less'></style>
