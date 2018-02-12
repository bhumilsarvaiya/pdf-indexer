<!-- eslint-disable  -->
<template>
    <div>
        <Table :columns="columns" :data="arrAnnotation"></Table>
    </div>
</template>
<script>
// eslint-disable-next-line
/* eslint-disable */
    import expandRow from './AnnotateDetail.vue';
    import moment from 'moment';
    var _ = require('lodash');
    
    export default {
        props: ['arrAnnotation', 'allAnnotations'],
        components: { expandRow },
        data() {
            return {
                columns: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    row: this.allAnnotations
                                }
                            })
                        }
                    },
                    {
                        title: 'File Name',
                        key: 'filename'
                    },
                    {
                        title: 'Markups',
                        key: 'total'
                    },
                    {
                        title: 'Last Modified',
                        key: 'updated'
                    },
                    // {
                    //     title: 'Action',
                    //     key: 'action',
                    //     width: 150,
                    //     align: 'center',
                    //     render: (h, params) => {
                    //         return h('div', [
                    //             h('Button', {
                    //                 props: {
                    //                     size: 'small',
                    //                     icon: 'ios-download-outline'
                    //                 },
                    //                 style: {
                    //                     marginRight: '5px'
                    //                 },
                    //                 on: {
                    //                     click: () => {
                    //                         //this.loadData()
                    //                     }
                    //                 }
                    //             }, '')
                    //         ]);
                    //     }
                    // }
                ],
                // data: this.arrAnnotation
            }
        },
    }
</script>