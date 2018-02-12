<!-- eslint-disable  -->
<style scoped>
    .expand-row {
        margin-bottom: 14px;
    }
</style>
<template>
    <div>
        <Button type="primary" icon="ios-download-outline" @click="download" style="margin-bottom: 10px;">download</Button>
        <Table :columns="columns" :data="data" ref="table"></Table>
        
    </div>
</template>
<script>
// eslint-disable-next-line
/* eslint-disable */
import moment from 'moment';
    export default {
        props: {
            row: Object
        },
        data() {
            return {
                columns: [
                    {
                        title: 'Tag',
                        key: 'tags'
                    },
                    {
                        title: 'Text',
                        key: 'exact'
                    },
                    {
                        title: 'Comment',
                        key: 'text'
                    }
                    ,
                    {
                        title: 'Last Modified',
                        key: 'updated'
                    }
                ],
                data: this.loadData()
            }
        },
        methods: {
            loadData() {
                let arrDetail = []
                this.row.rows.forEach(rowData => {
                    let objAnnotate = {}
                    let strTag = ''
                    
                    objAnnotate.text = rowData.text
                    objAnnotate.exact = rowData.target[0].selector[1].exact
                    objAnnotate.updated = moment(rowData.updated).calendar()
                    _.forEach(rowData.tags, function (value, key) {
                        
                        strTag = value+', ' 
                    });
                    objAnnotate.tags = strTag.slice(0, -2)
                    arrDetail.push(objAnnotate)
                });
                return arrDetail
            },
            download(){
                this.$refs.table.exportCsv({
                    filename: 'The original data',
                    original: false,
                    quoted: true
                });
            }
        }
    };
</script>