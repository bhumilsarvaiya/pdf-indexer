<template>
  <!-- eslint-disable  -->
  <div>
      <Menu mode="horizontal" :theme="'primary'"  >
        <Row type="flex">
            <i-col :span="3">
                <div class="f-logo">
                    <a href="#">
                        <img src="../assets/images/logo.png" style="margin-top: 10px;"> </a>
                </div>
            </i-col>
        </Row>
      </Menu>
    <div>
      <form-wizard @on-complete="onComplete"
                   @on-change="onChange"
                   title=""
                   subtitle=""
                   ref=vueFormWizard>
          <tab-content title="Upload file"
                       icon="ti-user">
              <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-error="dropzoneResponse"></vue-dropzone>
            <!-- <vue-dropzone :awss3="awss3" id="dropzone" :options="dropzoneOptions" v-on:vdropzone-s3-upload-error="s3UploadError" v-on:vdropzone-s3-upload-success="s3UploadSuccess"></vue-dropzone> -->
          </tab-content>
          <tab-content title="File Info"
                       icon="ti-settings">
            <Table :columns="columns1" :data="data1"></Table>
          </tab-content>
          <tab-content title="View Markups"
                       icon="ti-check">
            <annotate-table :arrAnnotation="arrAnnotation" :allAnnotations="annotationDetail"></annotate-table>
          </tab-content>
      </form-wizard>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
  import Vue from 'vue'
  import VueFormWizard from 'vue-form-wizard'
  Vue.use(VueFormWizard)
  import 'vue-form-wizard/dist/vue-form-wizard.min.css'
  import { FormWizard, TabContent } from 'vue-form-wizard'
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import axios from 'axios'
  import AnnotateTable from './AnnotateTable.vue'
  import moment from 'moment';

Vue.use(axios)
export default {
  name: 'Dropzone',
  data () {
    return {
      dropzoneOptions: {
          url: 'http://localhost:8081/upload',
          thumbnailWidth: 150,
          maxFilesize: 500,
          acceptedFiles: ".pdf",
          dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> Drop files here to upload"
        },
        columns1: [
          {
            title: '#',
            key: 'id'
          },
          {
            title: 'File Name',
            key: 'fileName'
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    icon: 'forward'
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.showAnnotatioinList(params)
                    }
                  }
                }, ''),
                h('Button', {
                  props: {
                    size: 'small',
                    icon: 'compose',
                  },
                  style: {
                    marginRight: '3px'
                  },
                  on: {
                    click: () => {
                      this.show(params)
                    }
                  }
                }, 'Index'),
                h('Button', {
                  props: {
                    size: 'small',
                    icon: 'trash-a',
                    // type: 'error'
                  },
                  on: {
                    click: () => {
                      this.deleteFile(params)
                    }
                  }
                }, ''),
              ]);
            }
          }
        ],
        data1: [],
        fileName: '',
        arrAnnotation: [],
        annotationDetail: []
      }
    },
    methods: {
      onComplete: function () {
        alert('Yay. Done!');
      },
      dropzoneResponse (file, response) {
        console.log('resp:', file)
        this.$Message.error(response);
        this.$refs.myVueDropzone.removeFile(file)
      },
      onChange(previous, next) {
        console.log('on change called:', previous, '--', next)
        this.$refs.myVueDropzone.removeAllFiles()
        if (previous == 0 && next == 1) {
          let self = this
          axios.get('http://localhost:8081/getFileList')
            .then(function (response) {
              self.data1 = response.data
            })
            .catch(function (error) {
              console.log(error);
            });
        }
        if (previous == 1 && next == 2) {
          let self = this
          axios.get('https://hypothes.is/api/search', {
            params: {
              // url: 'https://www.tutorialspoint.com/android/android_tutorial.pdf'
              url: 'http://localhost:8081/'+this.fileName
            }
          })
            .then(function (response) {
              let obj = {};
              let arrDate = []
              self.annotationDetail = response.data

              response.data.rows.forEach(data => {
                arrDate.push(data.updated)
              });
              obj.total = response.data.total,
              obj.filename = self.fileName
              obj.updated = moment(_.max(arrDate)).calendar();
              self.arrAnnotation.push(obj)
            })
            .catch(function (error) {
              console.log('error:', error);
            });
        } if (previous == 2 && next == 1) {
          this.arrAnnotation = []
        }
      },
      show(params) {
        this.fileName = params.row.fileName
        let url = "http://localhost:9080/#/"+params.row.fileName
        window.open(url, '_blank');
      },
      deleteFile(params){
        this.$Modal.confirm({
            title: 'Delete file',
            content: '<p>Do you want to delete file <b>'+params.row.fileName+'</b>?</p>',
            closable: true,
            okText: 'OK',
            cancelText: 'Cancel',
            onOk: () => {
              let self = this
              axios.get('http://localhost:8081/deleteFile', {
                params: {
                  filename: params.row.fileName,
                  id: params.row.id
                }
              })
              .then(function (response) {
                if(response.data.deleted == true){
                  self.data1.splice(params.index, 1);
                }
              })
              .catch(function (error) {
                console.log(error);
              });
            }
        });
      },
      showAnnotatioinList(params) {

        this.fileName = params.row.fileName
        this.$refs.vueFormWizard.nextTab()
      },
    },
    created () {
      this.$Message.config({
        duration: 3
      });
    },
    components: {
      FormWizard,
      TabContent,
      vueDropzone: vue2Dropzone,
      AnnotateTable
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1,
  h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
