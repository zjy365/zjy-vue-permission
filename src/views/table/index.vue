<template>
<el-table
    v-loading="loading"
    :data="tableData"
    style="width: 100%">
    <el-table-column
      label="日期"
      width="180">
      <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{ scope.row.date }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="姓名"
      width="180">
      <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <p>姓名: {{ scope.row.name }}</p>
          <p>住址: {{ scope.row.address }}</p>
          <div slot="reference" class="name-wrapper">
            <el-tag size="medium">{{ scope.row.name }}</el-tag>
          </div>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button
          v-permission="{action: 'edit', effect: 'disabled'}"
          size="mini"
          @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
        <el-button
          v-permission="{action: 'delete', effect: 'disabled'}"
          size="mini"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { getTableData, deleteTableData } from '@/api/table'
export default {
  name: 'TableIndex',
  components: {},
  props: {},
  data () {
    return {
      tableData: [],
      loading: true
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {
    getTableData().then(res => {
      this.tableData = res.data
      this.loading = false
    })
  },
  methods: {
    handleEdit (index, row) {
      console.log(index, row)
    },
    handleDelete (index, row) {
      console.log(index, row)
      deleteTableData().then(res => {
        console.log(res)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>
