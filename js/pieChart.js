// Menggunakan data dari file CSV eksternal
d3.csv('../data/nutrition.csv').then(function (data) {
    try {
        // Inisialisasi penghitung untuk setiap kategori
        const counts = {
            'High-Protein Foods': 0,
            'High-Fat Foods': 0,
            'High-Carbohydrate Foods': 0,
            'Low-Calorie Foods': 0
        };

        // Iterasi melalui setiap baris data
        data.forEach(function (d) {
            d.calories = +d.calories;
            d.proteins = +d.proteins;
            d.fat = +d.fat;
            d.carbohydrate = +d.carbohydrate;

            // Kategorisasi dan penghitungan data
            if (d.proteins >= 6 && d.proteins <= 10) {
                counts['High-Protein Foods']++;
            }
            if (d.fat >= 5 && d.fat <= 15) {
                counts['High-Fat Foods']++;
            }
            if (d.carbohydrate >= 20 && d.carbohydrate <= 40) {
                counts['High-Carbohydrate Foods']++;
            }
            if (d.calories >= 20 && d.calories <= 50) {
                counts['Low-Calorie Foods']++;
            }
        });

        // Hitung total makanan untuk seluruh kategori
        const totalFoodsForAllCategories = Object.values(counts).reduce((total, count) => total + count, 0);

        // Hitung persentase untuk setiap kategori
        const percentages = {
            'High-Protein Foods': (counts['High-Protein Foods'] / totalFoodsForAllCategories) * 100,
            'High-Fat Foods': (counts['High-Fat Foods'] / totalFoodsForAllCategories) * 100,
            'High-Carbohydrate Foods': (counts['High-Carbohydrate Foods'] / totalFoodsForAllCategories) * 100,
            'Low-Calorie Foods': (counts['Low-Calorie Foods'] / totalFoodsForAllCategories) * 100
        };

        const div = d3.select('body');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const radius = Math.min(height, width) / 2-60;
        const colorScale = d3.scaleOrdinal(d3.schemeSet2);
        const pieChartHeightPadding = 100;

        const svg = div.select("#pie-chart")
            .attr('height', height + pieChartHeightPadding)
            .attr('width', width)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${(height + pieChartHeightPadding) / 2})`);

        const pie = d3.pie().value(d => d).sort(null);

        const zeroArc = d3.arc()
            .innerRadius(0)
            .outerRadius(1)

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)

        const hoverArc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 30)

        const labelArc = d3.arc()
            .innerRadius(radius / 5)
            .outerRadius(radius);

        const g = svg.selectAll('.arc')
            .data(pie(Object.values(percentages)))
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', zeroArc)
            .attr('class', 'arc')
            .style('fill', (d, i) => colorScale(i))
            .style('fill-opacity', 0.7)
            .style('stroke-width', 2)
            .style('stroke', '#0E0B16')
            .on('mouseover', function (d, i) {
                d3.select(this)
                    .style('fill-opacity', 1)
                    .transition().duration(500)
                    .attr('d', hoverArc);
            })
            .on('mouseout', function (d, i) {
                d3.select(this)
                    .style('fill-opacity', 0.7)
                    .transition().duration(500)
                    .attr('d', arc);
            })
            .transition().duration(1000).delay((d, i) => i * 300)
            .attr('d', arc);

        const labelTexts = Object.keys(counts).map(category => `${percentages[category].toFixed(2)}%`);

        g.append('text')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .text((d, i) => labelTexts[i])
            .style('font-size', '32px')
            .style('font-family', 'cursive')
            .style('fill', '#333333')
            .style('fill-opacity', 0)
            .style('text-shadow', '1px 0px #0E0B16')
            .style('text-anchor', 'middle')
            .transition().duration(3000).delay((d, i) => i * 300)
            .style('fill-opacity', 1)

        g.on('mouseover', function (event, d) {
            // Menyiapkan konten HTML untuk tooltip
            const htmlContent = `
                <div>
                    <strong>Category:</strong> ${Object.keys(counts)[d.index]}<br>
                    <strong>Total:</strong> ${Object.values(counts)[d.index]} Menu<br>
                </div>
            `;

            // Menampilkan tooltip dengan konten HTML
            tooltip.html(htmlContent)
                .style('visibility', 'visible')
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
            .on('mousemove', function (event, d) {
                // Memindahkan tooltip sesuai dengan posisi mouse
                tooltip.style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                // Menyembunyikan tooltip
                tooltip.style('visibility', 'hidden');
            });

        // Menghitung lebar dan tinggi untuk legenda
        const legendRectSize = 20; // Ukuran persegi legenda
        const legendSpacing = 6; // Jarak antar item legenda
        const legendHeight = legendRectSize * 4 + legendSpacing * 3; // Tinggi total legenda untuk 4 kategori

        // Membuat kotak deskripsi untuk legenda
        const legendBox = svg.append('g')
            .attr('class', 'legend-box')
            // Posisikan kotak legenda sejajar dengan pusat pie chart
            .attr('transform', `translate(${radius + 40}, ${-legendHeight / 2})`);

        // Membuat background untuk legenda
        legendBox.append('rect')
            .attr('class', 'legend-bg')
            .attr('width', 200) // Lebar kotak legenda
            .attr('height', legendHeight) // Tinggi kotak legenda
            .attr('fill', '#f9f9f9')
            .attr('stroke', '#ccc')
            .attr('stroke-width', '1px');

        // Membuat legenda
        const legend = legendBox.selectAll('.legend')
            .data(Object.keys(percentages)) // Menggunakan kunci dari objek percentages untuk legenda
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(10, ${i * (legendRectSize + legendSpacing)})`);

        // Membuat persegi sebagai warna legenda
        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', (d, i) => colorScale(i))
            .style('stroke', (d, i) => colorScale(i));

        // Menambahkan teks ke legenda
        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(d => `${d}`) // Menampilkan nama kategori dan total nilai
            .style('font-size', '12px')
            .style('font-weight', 'normal')
            .style('fill', '#333');

        // Inisialisasi tooltip
        const tooltip = div.append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', '#FFF')
            .style('border', '1px solid #0E0B16')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('text-align', 'left')
            .style('font-size', '16px')
            .style('font-weight', '500')
            .style('box-shadow', '2px 4px 8px rgba(0, 0, 0, 0.3)')
            .style('pointer-events', 'none'); // Memastikan tooltip tidak mengganggu interaksi mouse
    } catch (error) {
        console.error('Error occurred while processing data:', error);
    }
});
