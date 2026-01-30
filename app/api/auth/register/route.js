import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/airtable';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req) {
    try {
        const body = await req.json();

        // Validate input
        let parsedData;
        try {
            parsedData = registerSchema.parse(body);
        } catch (zodError) {
            return NextResponse.json({ error: zodError.errors[0].message }, { status: 400 });
        }

        const { name, email, password } = parsedData;

        // Check if user exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await createUser({ name, email, password: hashedPassword });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
