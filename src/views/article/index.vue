<template>
    <div class='article-page'>
    <!-- 筛选区域 -->
    <el-card>
      <div slot="header">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>内容管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 表单 -->
      <el-form label-width="80px">
        <el-form-item label="状态：">
          <el-radio-group v-model="reqParams.status">
            <el-radio :label="null">全部</el-radio>
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">待审核</el-radio>
            <el-radio :label="2">审核通过</el-radio>
            <el-radio :label="3">审核失败</el-radio>
            <el-radio :label="4">已删除</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="频道：">
          <!-- :value="reqParams.channel_id" @input="reqParams.channel_id=$event" -->
          <my-channel v-model="reqParams.channel_id"></my-channel>
        </el-form-item>
        <el-form-item label="日期：">
          <el-date-picker
            v-model="dateArr"
            type="daterange"
            @change="changeDate"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="filterArticles">筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 结果区域 -->
    <el-card style="margin-top:20px">
      <div slot="header">根据筛选条件共查询到 {{ total }} 条结果：</div>
      <!-- 表格 -->
      <el-table :data="articles">
        <el-table-column label="封面">
          <template slot-scope="scope">
            <el-image :src="scope.row.cover.images[0]" style="width:200px;height:200px">
              <div slot="error" class="image-slot">
                <img src="" alt="" width="200px" height="150px">
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" width="200px"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status===0" type="info">草稿</el-tag>
            <el-tag v-if="scope.row.status===1">待审核</el-tag>
            <el-tag v-if="scope.row.status===2" type="success">审核通过</el-tag>
            <el-tag v-if="scope.row.status===3" type="warning">审核失败</el-tag>
            <el-tag v-if="scope.row.status===4" type="danger">已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阅读数" width="120px" prop="read_count"></el-table-column>
        <el-table-column label="评论数" width="120px" prop="comment_count"></el-table-column>        <el-table-column label="点赞数"  width="120px" prop="like_count"></el-table-column>
        <el-table-column label="发布时间" prop="pubdate"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button @click="$router.push('/publish?id='+scope.row.id)" type="primary" icon="el-icon-edit" circle plain></el-button>
            <el-button @click="deleteArticle(scope.row.id)" type="danger" icon="el-icon-delete" circle plain></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        style="margin-top:20px"
        background
        layout="prev, pager, next"
        @current-change="togglePage"
        :current-page="reqParams.page"
        :page-size="reqParams.per_page"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
import myChannel from '../../components/my-channel.vue'
export default {
  components: { myChannel },
  name: 'Article',
  created () {
    this.getArticles()
  },
  data () {
    return {
      reqParams: {
        status: null,
        channel_id: null,
        begin_pubdate: null,
        end_pubdate: null,
        page: 1,
        per_page: 10
      },
      dateArr: [],
      articles: [],
      total: 0
    }
  },
  methods: {
    async getArticles () {
      const { data } = await this.$http.get('/v1_0/mp/articles', { params: this.reqParams })
      this.articles = data.data.results
      this.total = data.data.total_count
    },
    togglePage (changePage) {
      this.reqParams.page = changePage
      this.getArticles()
    },
    filterArticles () {
      this.reqParams.page = 1
      this.getArticles()
    },
    changeDate (dateArr) {
      if (dateArr.length) {
        this.reqParams.begin_pubdate = dateArr[0]
        this.reqParams.end_pubdate = dateArr[1]
      } else {
        this.reqParams.begin_pubdate = null
        this.reqParams.end_pubdate = null
      }
    },
    deleteArticle (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.$http.delete(`/v1_0/mp/articles/${id}`)
        this.$message.success('删除成功')
        this.getArticles()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
<style scoped lang="less">
</style>
