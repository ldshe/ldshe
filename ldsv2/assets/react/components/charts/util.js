import * as d3 from 'd3';

export const trimLegend = (selector, legendLimit) => {
   $(selector).find('g.legend > text').each((i, t) => {
       let $n = $(t).contents()
                   .filter((i, n) => n.nodeType === Node.TEXT_NODE);
       let val = $n.text();
       if(legendLimit && val.length > legendLimit) {
           $n[0].textContent = val.substring(0, legendLimit ) + ' ...';
       }
   });
};

export const relaxText = (alpha=0.5, spacing=12) => {
    alpha = alpha || 0.5;
    spacing = spacing || 12;
    let relax = text => {
        let again = false;
        text.each(function(d, i) {
            let a = this;
            let da = d3.select(a);
            let x1 = Number(da.attr("cx"));
            let y1 = Number(da.attr("cy"));
            text.each(function (d, j) {
                let b = this;
                // a & b are the same element and don't collide.
                if (a == b) return;
                let db = d3.select(b);
                // a & b are on opposite sides of the chart and
                // don't collide
                if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                // Now let's calculate the distance between
                // these elements.
                let x2 = Number(db.attr("cx"));
                let y2 = Number(db.attr("cy"));
                let deltaY = y1 - y2;

                // If spacing is greater than our specified spacing,
                // they don't collide.
                if (Math.abs(deltaY) > spacing) return;

                // If the labels collide, we'll push each
                // of the two labels up and down a little bit.
                again = true;
                let sign = deltaY > 0 ? 1 : -1;
                let adjust = sign * alpha;
                // da.attr("y",+y1 + adjust);
                // db.attr("y",+y2 - adjust);

                y1 = Math.round((y1 + adjust) * 10) / 10;
                y2 = Math.round((y2 - adjust) * 10) / 10;

                da.attr("transform", d => `translate(${x1} ${y1})`);
                da.attr("cy", y1);

                db.attr("transform", d => `translate(${x2} ${y2})`);
                db.attr("cy", y2);
            });

        });

        if(again) {
            setTimeout(() => relax(text), 20)
        }
    }
    return relax;
}
