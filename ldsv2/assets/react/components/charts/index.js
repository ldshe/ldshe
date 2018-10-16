import pie from './pie';
import donut from './donut';
import horizontalBar from './horizontal_bar';

const Chart = {
    Pie: pie,
    Donut: donut,
    HorizontalBar: horizontalBar,
};

export default Chart;

export const {
    Pie,
    Donut,
    HorizontalBar,
} = Chart;
