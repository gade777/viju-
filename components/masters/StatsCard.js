// components/StatsCard.js
import { useState } from 'react';

const StatsCard = () => {
  const data = [
    { name: 'Sub-Admin', id: 1 },
    { name: 'Employee', id: 1 },
    { name: 'Teacher', id: 0 },
    { name: 'Student', id: 1 },
  ];

  const colorClasses = ['bg-danger', 'bg-primary', 'bg-info', 'bg-success'];

  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <div className="container">
      <div className="row justify-content-around">
        {data.map((value, index) => {
          const colorClass = colorClasses[index % colorClasses.length];

          return (
            <div
              key={index}
              className={`col-lg-3 col-md-6 col-sm-12 mb-3 text-center`}
            >
              <div
                className={`card ${colorClass} text-white shadow p-3 mb-5 bg-white rounded`}
                onClick={() => handleCategoryClick(value.id)}
              >
                <div className="card-body">
                  <i className="fa fa-code-fork"></i>
                  <span className="count-numbers" style={{ fontSize: '3em' }}>
                    {value.id + '/'}
                  </span>
                  <span className="count-name" style={{ fontSize: '1.5em' }}>
                    {value.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* <Employees isVisible={selectedCategory === 13} /> */}
    </div>
  );
};

export default StatsCard;
