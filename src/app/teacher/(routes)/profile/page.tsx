
import React from 'react';
import { UserProfile } from '@clerk/nextjs';

const TeacherProfilePage = () => {
  return (
    <div className="p-6 flex justify-center">
        <UserProfile routing="path" path="/teacher/profile" />
    </div>
  );
};

export default TeacherProfilePage;
